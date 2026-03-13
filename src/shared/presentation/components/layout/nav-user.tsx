"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/presentation/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/presentation/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/presentation/components/ui/sidebar";
import { Button } from "@/shared/presentation/components/ui/button";
import { authClient } from "../../libraries/auth/auth-client";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function UserAvatar({
  src,
  name,
  initials,
  className,
}: {
  src?: string | null;
  name?: string | null;
  initials: string;
  className?: string;
}) {
  return (
    <Avatar className={`rounded-lg ${className ?? "h-8 w-8"}`}>
      <AvatarImage src={src || undefined} alt={name || ""} />
      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
    </Avatar>
  );
}

function UserDropdownContent({
  user,
  initials,
  onNavigate,
  onSignOut,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  initials: string;
  onNavigate: (path: string) => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserAvatar
            src={user.image}
            name={user.name}
            initials={initials}
            className="h-8 w-8"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name || "User"}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => onNavigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </>
  );
}

function useUserDropdownActions() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user ?? null;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const handleNavigate = (path: string) => router.push(path);
  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return { user, userInitials, handleNavigate, handleSignOut };
}

// ---------------------------------------------------------------------------
// NavUser — full sidebar variant
// ---------------------------------------------------------------------------

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, userInitials, handleNavigate, handleSignOut } =
    useUserDropdownActions();

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                src={user.image}
                name={user.name}
                initials={userInitials}
                className="h-8 w-8"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user.name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <UserDropdownContent
              user={user}
              initials={userInitials}
              onNavigate={handleNavigate}
              onSignOut={handleSignOut}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ---------------------------------------------------------------------------
// NavUserCompact — avatar-only trigger for mobile header
// ---------------------------------------------------------------------------

export function NavUserCompact() {
  const { user, userInitials, handleNavigate, handleSignOut } =
    useUserDropdownActions();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg p-0"
          aria-label="User menu"
        >
          <UserAvatar
            src={user.image}
            name={user.name}
            initials={userInitials}
            className="h-7 w-7"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <UserDropdownContent
          user={user}
          initials={userInitials}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
