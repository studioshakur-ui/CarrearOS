"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OnboardingState = {
  error: string | null;
};

const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required.").max(100),
  last_name: z.string().min(1, "Last name is required.").max(100),
  country_code: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
  experience_level: z.enum(["intern", "junior", "mid", "senior", "lead", "unknown"]),
  remote_preference: z.enum(["onsite", "hybrid", "remote", "unknown"]),
  mobility: z.enum(["local_only", "national", "international", "remote_only", "unknown"]),
  languages: z.string().max(500).optional(),
  desired_roles: z.string().max(500).optional(),
});

export async function saveOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Validate profile fields
  const parsed = profileSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    country_code: (formData.get("country_code") as string)?.trim().toUpperCase() || undefined,
    city: (formData.get("city") as string)?.trim() || undefined,
    experience_level: formData.get("experience_level"),
    remote_preference: formData.get("remote_preference"),
    mobility: formData.get("mobility"),
    languages: (formData.get("languages") as string)?.trim() || undefined,
    desired_roles: (formData.get("desired_roles") as string)?.trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const { first_name, last_name, country_code, city, experience_level, remote_preference, mobility, languages, desired_roles } =
    parsed.data;

  const languagesArray = languages ? languages.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const rolesArray = desired_roles ? desired_roles.split(",").map((s) => s.trim()).filter(Boolean) : [];

  // Persist profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      country_code: country_code ?? null,
      city: city ?? null,
      experience_level,
      remote_preference,
      mobility,
      languages: languagesArray,
      desired_roles: rolesArray,
      is_profile_complete: true,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Handle optional CV upload
  const cvFile = formData.get("cv") as File | null;

  if (cvFile && cvFile.size > 0) {
    if (cvFile.type !== "application/pdf") {
      return { error: "CV must be a PDF file." };
    }

    if (cvFile.size > MAX_CV_BYTES) {
      return { error: "CV file must be smaller than 10 MB." };
    }

    const admin = createSupabaseAdminClient();
    const cvId = crypto.randomUUID();
    const sanitizedName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${cvId}_${sanitizedName}`;

    const bytes = await cvFile.arrayBuffer();

    const { error: uploadError } = await admin.storage.from("cvs").upload(storagePath, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Demote any existing primary CV, then insert the new one
    await supabase.from("cvs").update({ is_primary: false }).eq("profile_id", user.id);

    const { error: cvError } = await supabase.from("cvs").insert({
      id: cvId,
      profile_id: user.id,
      file_name: cvFile.name,
      storage_bucket: "cvs",
      storage_path: storagePath,
      mime_type: "application/pdf",
      size_bytes: cvFile.size,
      is_primary: true,
      parsed_text_status: "pending",
    });

    if (cvError) {
      return { error: `Failed to save CV record: ${cvError.message}` };
    }
  }

  redirect("/app/profile");
}
