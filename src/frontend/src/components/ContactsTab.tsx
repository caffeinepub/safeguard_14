// Legacy tab component - not used in current layout
import { Users } from "lucide-react";

export function ContactsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <Users size={36} className="text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        Use the sidebar to manage emergency contacts.
      </p>
    </div>
  );
}
