import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("~/server/db/index.ts", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("~/server/db/index.ts")
  >();
  const { createTestDb } = await import("../../../tests/db.ts");
  const { db, client, cleanup } = await createTestDb(original.createDb);
  return { ...original, default: db, _client: client, _cleanup: cleanup };
});

vi.mock("~/server/services/files.ts", () => ({
  uploadUserAvatar: vi.fn(),
  removeUserAvatar: vi.fn(),
  uploadPostImageFile: vi.fn(),
  deletePostImageFile: vi.fn(),
  deleteAllPostImageFiles: vi.fn(),
}));

const dbModule = await import("~/server/db/index.ts");
const db = dbModule.default;
const dbExtras = dbModule as unknown as {
  _client: { execute: (sql: string) => Promise<unknown> };
  _cleanup: () => void;
};

const { users } = await import("~/server/db/schema/auth.ts");
const { postImages, posts } = await import("~/server/db/schema/blog.ts");
const filesService = await import("~/server/services/files.ts");
const postsService = await import("~/server/services/posts.ts");

let userId: number;

beforeAll(async () => {
  const [user] = await db
    .insert(users)
    .values({ name: "Test User", email: "test@example.com" })
    .returning({ id: users.id });
  userId = user.id;
});

afterAll(() => {
  dbExtras._cleanup();
});

beforeEach(async () => {
  await dbExtras._client.execute("delete from post_images");
  await dbExtras._client.execute("delete from posts");
  vi.mocked(filesService.uploadPostImageFile).mockReset();
  vi.mocked(filesService.deletePostImageFile).mockReset();
  vi.mocked(filesService.deleteAllPostImageFiles).mockReset();
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when none exists", async () => {
    expect(await postsService.generateUniqueSlug("Hello World")).toBe(
      "hello-world",
    );
  });

  it("appends -2 when the base slug is taken", async () => {
    await db.insert(posts).values({
      slug: "hello-world",
      title: "Hello",
      content: "x",
      authorId: userId,
    });
    expect(await postsService.generateUniqueSlug("Hello World")).toBe(
      "hello-world-2",
    );
  });

  it("counts past existing suffixes", async () => {
    await db.insert(posts).values([
      { slug: "hello", title: "a", content: "x", authorId: userId },
      { slug: "hello-2", title: "b", content: "x", authorId: userId },
      { slug: "hello-3", title: "c", content: "x", authorId: userId },
    ]);
    expect(await postsService.generateUniqueSlug("hello")).toBe("hello-4");
  });

  it("excludes a specific id when reslugging the same post", async () => {
    const [created] = await db
      .insert(posts)
      .values({ slug: "hello", title: "x", content: "x", authorId: userId })
      .returning({ id: posts.id });
    expect(
      await postsService.generateUniqueSlug("Hello", created.id),
    ).toBe("hello");
  });

  it("falls back to 'post' for an empty source", async () => {
    expect(await postsService.generateUniqueSlug("")).toBe("post");
  });
});

describe("setCoverImage", () => {
  it("marks one image as cover and clears the others", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });

    const inserted = await db
      .insert(postImages)
      .values([
        { postId: post.id, s3Key: "a", position: 0, isCover: true },
        { postId: post.id, s3Key: "b", position: 1, isCover: false },
      ])
      .returning({ id: postImages.id });

    await postsService.setCoverImage(post.id, inserted[1].id);

    const after = await db.query.postImages.findMany({
      where: { postId: post.id },
    });
    const a = after.find((i) => i.id === inserted[0].id);
    const b = after.find((i) => i.id === inserted[1].id);
    expect(a?.isCover).toBe(false);
    expect(b?.isCover).toBe(true);
  });

  it("clears all covers when imageId is null", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });
    await db.insert(postImages).values({
      postId: post.id,
      s3Key: "a",
      position: 0,
      isCover: true,
    });

    await postsService.setCoverImage(post.id, null);

    const after = await db.query.postImages.findMany({
      where: { postId: post.id },
    });
    expect(after.every((i) => !i.isCover)).toBe(true);
  });

  it("rejects an image that does not belong to the post", async () => {
    const [postA] = await db
      .insert(posts)
      .values({ slug: "a", title: "A", content: "x", authorId: userId })
      .returning({ id: posts.id });
    const [postB] = await db
      .insert(posts)
      .values({ slug: "b", title: "B", content: "x", authorId: userId })
      .returning({ id: posts.id });
    const [imgB] = await db
      .insert(postImages)
      .values({ postId: postB.id, s3Key: "b", position: 0 })
      .returning({ id: postImages.id });

    await expect(postsService.setCoverImage(postA.id, imgB.id)).rejects
      .toThrow();
  });
});

describe("updatePostImageAlt", () => {
  it("updates the alt text for the given image", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });
    const [img] = await db
      .insert(postImages)
      .values({ postId: post.id, s3Key: "a", position: 0, alt: "old" })
      .returning({ id: postImages.id });

    await postsService.updatePostImageAlt(img.id, "new alt");

    const after = await db.query.postImages.findFirst({
      where: { id: img.id },
    });
    expect(after?.alt).toBe("new alt");
  });
});

describe("attachImageToPost", () => {
  it("stores the uploaded image at the next position", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });

    vi.mocked(filesService.uploadPostImageFile).mockResolvedValue({
      s3Key: "posts/1/abc-2560.webp",
      width: 2560,
      height: 1440,
    });

    await db.insert(postImages).values({
      postId: post.id,
      s3Key: "existing",
      position: 0,
    });

    const file = new File([new Uint8Array(10)], "x.webp", {
      type: "image/webp",
    });
    const result = await postsService.attachImageToPost(post.id, file, "cap");

    expect(result.position).toBe(1);
    expect(result.s3Key).toBe("posts/1/abc-2560.webp");

    const all = await db.query.postImages.findMany({
      where: { postId: post.id },
    });
    expect(all).toHaveLength(2);
  });

  it("throws when the post does not exist", async () => {
    const file = new File([new Uint8Array(0)], "x");
    await expect(
      postsService.attachImageToPost(9999, file, null),
    ).rejects.toThrow("Post not found");
  });
});

describe("deletePostImage", () => {
  it("removes the row and triggers S3 cleanup", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });
    const [img] = await db
      .insert(postImages)
      .values({
        postId: post.id,
        s3Key: "posts/1/abc-2560.webp",
        position: 0,
      })
      .returning({ id: postImages.id });

    vi.mocked(filesService.deletePostImageFile).mockResolvedValue();

    await postsService.deletePostImage(img.id);

    const after = await db.query.postImages.findFirst({
      where: { id: img.id },
    });
    expect(after).toBeUndefined();
    expect(filesService.deletePostImageFile).toHaveBeenCalledWith(
      "posts/1/abc-2560.webp",
    );
  });

  it("is a no-op for a missing imageId", async () => {
    await postsService.deletePostImage(9999);
    expect(filesService.deletePostImageFile).not.toHaveBeenCalled();
  });
});

describe("deletePostWithCleanup", () => {
  it("deletes the post and triggers bucket cleanup", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });

    vi.mocked(filesService.deleteAllPostImageFiles).mockResolvedValue();

    await postsService.deletePostWithCleanup(post.id);

    const after = await db.query.posts.findFirst({ where: { id: post.id } });
    expect(after).toBeUndefined();
    expect(filesService.deleteAllPostImageFiles).toHaveBeenCalledWith(post.id);
  });

  it("cascades to delete related post_images rows on FK", async () => {
    const [post] = await db
      .insert(posts)
      .values({ slug: "p", title: "P", content: "x", authorId: userId })
      .returning({ id: posts.id });
    await db.insert(postImages).values({
      postId: post.id,
      s3Key: "k",
      position: 0,
    });

    vi.mocked(filesService.deleteAllPostImageFiles).mockResolvedValue();
    await postsService.deletePostWithCleanup(post.id);

    const remaining = await db.query.postImages.findMany({
      where: { postId: post.id },
    });
    expect(remaining).toHaveLength(0);
  });
});
