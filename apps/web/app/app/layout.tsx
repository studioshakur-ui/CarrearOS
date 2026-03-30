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
      description="Manage your profile, review opportunities, and get AI-powered career guidance tailored to the Gulf market."
      userEmail={user.email}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
