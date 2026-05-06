import { AvatarUpload } from "~/components/avatar-upload.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/components/ui/item.tsx";

import { useSession } from "~/contexts/session-context.tsx";

import { format } from "date-fns";
import type { JSX } from "solid-js";
import { NameEditDialog } from "./_components/name-dialog.tsx";

export default function AccountIndexRoute(): JSX.Element {
  const session = useSession();

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div class="flex w-full items-center justify-between gap-4">
        <div>
          <h2>Account</h2>
          <p class="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <AvatarUpload
          imageUrl={session.user.image}
          userName={session.user.name}
        />
      </div>

      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <ItemDescription>
              Name
            </ItemDescription>
            <ItemTitle>
              {session.user.name}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <NameEditDialog currentName={session.user.name} />
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              Email
            </ItemDescription>
            <ItemTitle>
              {session.user.email}
            </ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemDescription>
              Account created
            </ItemDescription>
            <ItemTitle>
              {format(new Date(session.user.createdAt), "dd.MM.yyyy")}
            </ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
