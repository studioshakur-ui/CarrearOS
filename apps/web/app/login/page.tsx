import { AuthCard } from "@/components/auth/auth-card";

import { loginAction } from "../auth/actions";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      mode="login"
      title="Log in"
      description="Use your account to access the application workspace."
      message={params?.message}
      next={params?.next}
      action={loginAction}
    />
  );
}
