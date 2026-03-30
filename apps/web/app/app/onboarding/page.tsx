import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { PageIntro } from "@/components/layout/page-intro";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: primaryCv }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("cvs")
      .select("file_name, created_at")
      .eq("profile_id", user.id)
      .eq("is_primary", true)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Set up your profile"
        description="Tell us about yourself so we can match you with the right opportunities in the Gulf region."
      />
      <OnboardingForm profile={profile} primaryCv={primaryCv} />
    </div>
  );
}
