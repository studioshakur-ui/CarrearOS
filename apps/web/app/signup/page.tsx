import { AuthCard } from "@/components/auth/auth-card";

import { signupAction } from "../auth/actions";

type SignupPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      mode="signup"
      title="Create account"
      description="Create a simple email and password account to access the application workspace."
      message={params?.message}
      action={signupAction}
    />
  );
}
