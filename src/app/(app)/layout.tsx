import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/shared/presentation/components/ui/sidebar";
import { AppSidebar } from "@/shared/presentation/components/layout/app-sidebar";
import { Header } from "@/shared/presentation/components/layout/header";
import { auth } from "@/shared/presentation/libraries/auth/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (!session.session.activeOrganizationId) {
    redirect("/organizations");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Skip to main content — visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:outline-none"
      >
        Skip to main content
      </a>

      <AppSidebar />

      {/* Page shell: header above, content below */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          aria-label="Main content"
          className="flex-1 p-[clamp(1rem,4vw,1.5rem)]"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
