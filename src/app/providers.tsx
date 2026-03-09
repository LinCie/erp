"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { authClient } from "@/shared/presentation/libraries/auth/auth-client";
import { TooltipProvider } from "@/shared/presentation/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={Link}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </ThemeProvider>
    </AuthUIProvider>
  );
}
