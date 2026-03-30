"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { FileText, Upload } from "lucide-react";

import { saveOnboardingAction, type OnboardingState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Profile = {
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  city: string | null;
  experience_level: string;
  remote_preference: string;
  mobility: string;
  languages: string[] | null;
  desired_roles: string[] | null;
  is_profile_complete: boolean;
};

type PrimaryCv = {
  file_name: string;
  created_at: string;
} | null;

type OnboardingFormProps = {
  profile: Profile | null;
  primaryCv: PrimaryCv;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  { value: "unknown", label: "Not specified" },
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Principal" },
];

const REMOTE_TYPES = [
  { value: "unknown", label: "Not specified" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const MOBILITY_TYPES = [
  { value: "unknown", label: "Not specified" },
  { value: "local_only", label: "Local only" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
  { value: "remote_only", label: "Remote only" },
];

// ─── Field primitives ─────────────────────────────────────────────────────────

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-0";

const labelClass = "block text-sm font-medium text-slate-700";

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      {children}
      {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? "unknown"} className={cn(inputClass, "cursor-pointer")}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : isUpdate ? "Update profile" : "Save and continue →"}
    </Button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const initial: OnboardingState = { error: null };

export function OnboardingForm({ profile, primaryCv }: OnboardingFormProps) {
  const [state, formAction] = useActionState(saveOnboardingAction, initial);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const isUpdate = profile?.is_profile_complete ?? false;
  const joinedLanguages = Array.isArray(profile?.languages) ? profile.languages.join(", ") : "";
  const joinedRoles = Array.isArray(profile?.desired_roles) ? profile.desired_roles.join(", ") : "";

  return (
    <form action={formAction} className="space-y-5">
      {/* ── About you ──────────────────────────────────────────────────── */}
      <Section eyebrow="About you">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <input
              name="first_name"
              type="text"
              autoComplete="given-name"
              defaultValue={profile?.first_name ?? ""}
              className={inputClass}
              placeholder="Hamid"
            />
          </Field>
          <Field label="Last name">
            <input
              name="last_name"
              type="text"
              autoComplete="family-name"
              defaultValue={profile?.last_name ?? ""}
              className={inputClass}
              placeholder="Benali"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" helper="2-letter code — AE, SA, QA…">
            <input
              name="country_code"
              type="text"
              maxLength={2}
              defaultValue={profile?.country_code ?? ""}
              className={cn(inputClass, "uppercase")}
              placeholder="AE"
            />
          </Field>
          <Field label="City">
            <input
              name="city"
              type="text"
              defaultValue={profile?.city ?? ""}
              className={inputClass}
              placeholder="Dubai"
            />
          </Field>
        </div>

        <Field label="Experience level">
          <Select name="experience_level" defaultValue={profile?.experience_level} options={EXPERIENCE_LEVELS} />
        </Field>
      </Section>

      {/* ── Preferences ────────────────────────────────────────────────── */}
      <Section eyebrow="Job preferences">
        <Field label="Languages" helper="Comma-separated — English, French, Arabic">
          <input
            name="languages"
            type="text"
            defaultValue={joinedLanguages}
            className={inputClass}
            placeholder="English, Arabic"
          />
        </Field>

        <Field label="Target roles" helper="Comma-separated — Software Engineer, Backend Developer">
          <input
            name="desired_roles"
            type="text"
            defaultValue={joinedRoles}
            className={inputClass}
            placeholder="Software Engineer, Tech Lead"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Remote preference">
            <Select name="remote_preference" defaultValue={profile?.remote_preference} options={REMOTE_TYPES} />
          </Field>
          <Field label="Mobility">
            <Select name="mobility" defaultValue={profile?.mobility} options={MOBILITY_TYPES} />
          </Field>
        </div>
      </Section>

      {/* ── CV upload ───────────────────────────────────────────────────── */}
      <Section eyebrow="Your CV">
        {primaryCv ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{primaryCv.file_name}</p>
              <p className="text-xs text-slate-400">Current CV · upload a new file to replace</p>
            </div>
          </div>
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-50">
          <Upload className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{selectedFile ?? (primaryCv ? "Replace CV (PDF · max 10 MB)" : "Upload CV (PDF · max 10 MB)")}</span>
          <input
            type="file"
            name="cv"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </Section>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {state.error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      ) : null}

      <SubmitButton isUpdate={isUpdate} />
    </form>
  );
}
