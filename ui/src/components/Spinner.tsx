import { Spinner as UiSpinner } from "@/components/ui/spinner";

export const Spinner = () => (
  <div className="flex h-full w-full flex-1 items-center justify-center py-8">
    <UiSpinner className="size-6 text-muted-foreground" />
  </div>
);
