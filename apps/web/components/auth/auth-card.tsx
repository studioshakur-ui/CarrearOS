import Link from "next/link";

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
    <main className="flex min-h-screen bg-[#f7f6f3]">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-[440px] shrink-0 flex-col justify-between border-r border-[#e2dfd9] bg-[#0c0c0c] px-12 py-14">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-white/20">Career Agent</p>
          <p className="mt-3 text-sm font-medium text-white/50 leading-relaxed">Gulf Career Intelligence</p>
        </div>
        <div>
          <p className="text-2xl font-semibold leading-snug text-white/70">
            Every serious<br />application,<br />done with precision.
          </p>
          <p className="mt-5 text-sm text-white/25">UAE-first. AI-powered. For senior candidates.</p>
        </div>
        <p className="text-[10px] text-white/15 uppercase tracking-widest">Gulf Market · Private Advisory</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9e9b95]">Access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1a1916]">{title}</h1>
          <p className="mt-2 text-sm text-[#6a6761]">{description}</p>

          {message && (
            <div className="mt-6 rounded-lg border border-[#e2dfd9] bg-white px-4 py-3 text-sm text-[#6a6761]">
              {message}
            </div>
          )}

          <form action={action} className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next ?? "/app/onboarding"} />

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e9b95]" htmlFor={`${mode}-email`}>
                Email
              </label>
              <input
                id={`${mode}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 w-full rounded-lg border border-[#e2dfd9] bg-white px-4 text-sm text-[#1a1916] outline-none transition focus:border-[#9e9b95] placeholder:text-[#c4c1bb]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e9b95]" htmlFor={`${mode}-password`}>
                Password
              </label>
              <input
                id={`${mode}-password`}
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="h-11 w-full rounded-lg border border-[#e2dfd9] bg-white px-4 text-sm text-[#1a1916] outline-none transition focus:border-[#9e9b95]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                className="h-11 w-full rounded-lg bg-[#0c0c0c] text-sm font-medium text-white/80 transition hover:bg-[#1a1a1a] hover:text-white"
              >
                {isLogin ? "Sign in" : "Create account"}
              </button>
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="text-center text-sm text-[#9e9b95] transition hover:text-[#1a1916]"
              >
                {isLogin ? "No account? Sign up" : "Already have an account? Sign in"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
