"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/app/jobs",       label: "Roles" },
  { href: "/app/profile",    label: "Profile" },
  { href: "/app/cv",         label: "CV" },
  { href: "/app/onboarding", label: "Settings" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {navigation.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded px-3 py-2 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-white/[0.08] text-white/80"
                : "text-white/40 hover:bg-white/[0.05] hover:text-white/65",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
