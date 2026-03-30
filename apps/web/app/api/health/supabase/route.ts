import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function hasRequiredEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function GET() {
  if (!hasRequiredEnv()) {
    return NextResponse.json(
      {
        ok: false,
        status: "missing_env",
        message: "Supabase environment variables are not fully configured.",
      },
      { status: 500 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          status: "unreachable",
          message: error.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "connected",
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown Supabase error.",
      },
      { status: 500 },
    );
  }
}
