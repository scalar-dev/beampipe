import { Link } from "react-router-dom";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { User } from "../../utils/auth";
import { Avatar as UiAvatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Avatar = ({ user }: { user: User }) => {
  const initials = user.name
    ?.replace(
      /(?:^|\s|-)+([^\s-])[^\s-]*(?:(?:\s+)(?:the\s+)?(?:jr|sr|II|2nd|III|3rd|IV|4th)\.?$)?/gi,
      "$1"
    )
    .toLocaleUpperCase()
    .substring(0, 2) || "★";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <UiAvatar>
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </UiAvatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        <DropdownMenuLabel className="font-normal">
          {user.name && (
            <div className="text-sm font-medium text-foreground">{user.name}</div>
          )}
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/sign-out">
            <LogOutIcon />
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
