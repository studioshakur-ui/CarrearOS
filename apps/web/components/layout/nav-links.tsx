"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, FileText, LayoutDashboard, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/app/onboarding", label: "Onboarding", icon: LayoutDashboard },
  { href: "/app/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/app/profile", label: "Profile", icon: UserCircle2 },
  { href: "/app/cv", label: "CV", icon: FileText },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
              isActive
                ? "bg-slate-100 font-medium text-slate-950"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon className={cn("h-4 w-4", isActive ? "text-slate-800" : "text-slate-400")} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
