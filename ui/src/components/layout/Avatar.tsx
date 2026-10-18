import { Link } from "react-router-dom";
import { ChevronDownIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { User } from "../../utils/auth";
import { Avatar as UiAvatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Avatar = ({ user }: { user: User }) => {
  const initials =
    user.name
      ?.replace(
        /(?:^|\s|-)+([^\s-])[^\s-]*(?:(?:\s+)(?:the\s+)?(?:jr|sr|II|2nd|III|3rd|IV|4th)\.?$)?/gi,
        "$1"
      )
      .toLocaleUpperCase()
      .substring(0, 2) ||
    user.email?.charAt(0).toLocaleUpperCase() ||
    "?";
  const displayName = user.name || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full pr-2 pl-1 md:pr-3"
        >
          <UiAvatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </UiAvatar>
          <span className="sr-only text-sm font-medium md:not-sr-only md:max-w-48 md:truncate">
            {displayName}
          </span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="truncate text-sm font-medium text-foreground">
            {displayName}
          </div>
          {user.name && (
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          )}
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
