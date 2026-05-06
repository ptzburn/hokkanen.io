import { Button } from "~/components/ui/button.tsx";
import Copy from "~icons/lucide/copy";

import type { JSX } from "solid-js";
import { toast } from "solid-sonner";

type BackupCodesStepProps = {
  backupCodes: string[];
  onDone: () => void;
};

export function BackupCodesStep(props: BackupCodesStepProps): JSX.Element {
  function handleCopy(): void {
    navigator.clipboard.writeText(props.backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  }

  return (
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
        {props.backupCodes.map((code) => (
          <div class="py-1 text-center">{code}</div>
        ))}
      </div>
      <Button variant="outline" class="w-full" onClick={handleCopy}>
        <Copy class="mr-2 size-4" />
        Copy
      </Button>
      <Button class="w-full" onClick={props.onDone}>
        Done
      </Button>
    </div>
  );
}
