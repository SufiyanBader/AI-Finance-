"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plane, TrendingUp, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Plane },
  { href: "/portfolio", label: "Portfolio", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link key={link.href} href={link.href} className="relative">
            <Button
              variant="ghost"
              className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={18} />
              <span className="ml-2">{link.label}</span>
            </Button>
            {isActive && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-md -z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
