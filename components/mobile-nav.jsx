"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plane, TrendingUp, BarChart3, Target, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Plane },
  { href: "/portfolio", label: "Portfolio", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer when pathname changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4 flex flex-col space-y-2">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-base",
                    isActive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 font-semibold" : "text-muted-foreground"
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
