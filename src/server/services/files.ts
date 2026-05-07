import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import env from "~/env.ts";
import {
  normalizeToWebp,
  normalizeToWebpVariants,
} from "~/server/services/images.ts";

const client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function uploadUserAvatar(
  file: File,
  userId: string,
): Promise<string> {
  const image = await normalizeToWebp(file);

  await removeUserAvatar(userId);

  const uniqueId = crypto.randomUUID();
  const fileKey = `users/${userId}/avatar/${uniqueId}.${image.extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    Body: image.body,
    ContentType: image.contentType,
  });

  const result = await client.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error("Failed to upload avatar");
  }

  return fileKey;
}

export async function removeUserAvatar(
  userId: string,
): Promise<void> {
  const prefix = `users/${userId}/avatar/`;

  const listCommand = new ListObjectsCommand({
    Bucket: env.S3_BUCKET,
    Prefix: prefix,
  });

  const { Contents } = await client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    return;
  }

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: object.Key,
      });

      return client.send(deleteCommand);
    }),
  );
}

export type PostImageUploadResult = {
  s3Key: string;
  width: number;
  height: number;
};

export async function uploadPostImageFile(
  postId: number,
  file: File,
): Promise<PostImageUploadResult> {
  const variants = await normalizeToWebpVariants(file);
  const master = variants[variants.length - 1];
  const uniqueId = crypto.randomUUID();
  const baseKey = `posts/${postId}/${uniqueId}`;

  await Promise.all(variants.map(async (variant) => {
    const result = await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `${baseKey}-${variant.width}.${variant.extension}`,
        Body: variant.body,
        ContentType: variant.contentType,
      }),
    );
    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error("Failed to upload image");
    }
  }));

  return {
    s3Key: `${baseKey}-${master.width}.${master.extension}`,
    width: master.width,
    height: master.height,
  };
}

export async function deletePostImageFile(s3Key: string): Promise<void> {
  const baseKey = s3Key.replace(/-\d+\.webp$/, "");
  if (baseKey === s3Key) {
    await client.send(
      new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: s3Key }),
    );
    return;
  }

  const { Contents } = await client.send(
    new ListObjectsCommand({
      Bucket: env.S3_BUCKET,
      Prefix: `${baseKey}-`,
    }),
  );

  if (!Contents || Contents.length === 0) return;

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();
      return client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: object.Key,
        }),
      );
    }),
  );
}

export async function deleteAllPostImageFiles(
  postId: number,
): Promise<void> {
  const prefix = `posts/${postId}/`;

  const listCommand = new ListObjectsCommand({
    Bucket: env.S3_BUCKET,
    Prefix: prefix,
  });

  const { Contents } = await client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    return;
  }

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();
      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: object.Key,
      });
      return client.send(deleteCommand);
    }),
  );
}
