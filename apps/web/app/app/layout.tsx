import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/actions";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      eyebrow="Workspace"
      title="Career Command Center"
      description="A restrained application shell for onboarding, jobs, profile, and CV management. Business workflows will be layered in later."
      userEmail={user.email}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
