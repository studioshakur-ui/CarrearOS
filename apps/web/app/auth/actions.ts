"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const next = typeof formData.get("next") === "string" ? formData.get("next") : "/app/onboarding";

  if (!parsed.success) {
    redirect(`/login?message=${encodeMessage(parsed.error.issues[0]?.message ?? "Unable to sign in.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/login?message=${encodeMessage(error.message)}`);
  }

  redirect(typeof next === "string" && next.startsWith("/app") ? next : "/app/onboarding");
}

export async function signupAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/signup?message=${encodeMessage(parsed.error.issues[0]?.message ?? "Unable to create account.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/signup?message=${encodeMessage(error.message)}`);
  }

  if (data.session) {
    redirect("/app/onboarding");
  }

  redirect("/login?message=Account created. Check your email if confirmation is enabled.");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login?message=Signed out.");
}
