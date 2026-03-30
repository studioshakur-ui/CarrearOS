import Link from "next/link";

import { Button } from "@/components/ui/button";

type AuthCardProps = {
  mode: "login" | "signup";
  title: string;
  description: string;
  message?: string;
  action: (formData: FormData) => Promise<void>;
  next?: string;
};

export function AuthCard({ mode, title, description, message, action, next }: AuthCardProps) {
  const isLogin = mode === "login";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-20 sm:px-6">
      <section className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.4)] backdrop-blur">
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Access</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

        {message ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <form action={action} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next ?? "/app/onboarding"} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={`${mode}-email`}>
              Email
            </label>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor={`${mode}-password`}>
              Password
            </label>
            <input
              id={`${mode}-password`}
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              className="h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" size="lg">
              {isLogin ? "Log in" : "Create account"}
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={isLogin ? "/signup" : "/login"}>{isLogin ? "Go to signup" : "Go to login"}</Link>
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
