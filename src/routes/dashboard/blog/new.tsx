import { A, useAction, useNavigate } from "@solidjs/router";
import { createPostAction } from "~/actions/posts.ts";
import { Button } from "~/components/ui/button.tsx";
import ChevronLeft from "~icons/lucide/chevron-left";
import type { JSX } from "solid-js";
import { toast } from "solid-sonner";
import { PostForm } from "./_components/post-form.tsx";

export default function NewPostRoute(): JSX.Element {
  const create = useAction(createPostAction);
  const navigate = useNavigate();

  return (
    <div class="flex flex-1 flex-col gap-4">
      <div class="flex items-center gap-2">
        <Button as={A} href="/dashboard/blog" variant="ghost" size="icon-sm">
          <ChevronLeft class="size-4" />
        </Button>
        <div>
          <h2>New post</h2>
          <p class="text-muted-foreground">Saved as a draft.</p>
        </div>
      </div>

      <PostForm
        submitLabel="Create draft"
        onSubmit={async (value) => {
          try {
            const created = await create({
              title: value.title,
              content: value.content,
              excerpt: value.excerpt || undefined,
            });
            toast.success("Draft created");
            navigate(`/dashboard/blog/${created.id}/edit`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
          }
        }}
      />
    </div>
  );
}
