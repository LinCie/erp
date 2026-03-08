import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <main className="flex flex-1 flex-col min-h-screen bg-background">
      <div className="flex-1 p-6">{children}</div>
    </main>
  );
}
