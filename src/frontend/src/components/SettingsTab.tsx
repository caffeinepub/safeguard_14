// Legacy tab component - not used in current layout
import { Settings } from "lucide-react";

interface Props {
  safetyMode?: boolean;
  setSafetyMode?: (v: boolean) => void;
}

export function SettingsTab(_props: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <Settings size={36} className="text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        Settings are managed in the main app.
      </p>
    </div>
  );
}
