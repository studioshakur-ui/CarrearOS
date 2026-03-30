"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, FileText, Settings, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/app/jobs",       label: "UAE Roles",  icon: BriefcaseBusiness },
  { href: "/app/profile",    label: "Profile",    icon: UserCircle2 },
  { href: "/app/cv",         label: "CV",         icon: FileText },
  { href: "/app/onboarding", label: "Settings",   icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">
        Navigation
      </p>
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all",
              isActive
                ? "bg-white/10 text-white"
                : "text-white/40 hover:bg-white/[0.06] hover:text-white/70",
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isActive ? "text-white" : "text-white/30 group-hover:text-white/50",
              )}
            />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
