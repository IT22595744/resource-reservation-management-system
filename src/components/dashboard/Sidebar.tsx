
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  X,
  Layers3,
  FolderKanban,
} from "lucide-react";

type SidebarProps = {
  isAdmin: boolean;
};

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Resources",
    href: "/dashboard/resources",
    icon: Layers3,
  },
  {
    name: "My Reservations",
    href: "/dashboard/reservations",
    icon: CalendarDays,
  },
];

export default function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
      ...navigation,
      ...(isAdmin
        ? [
            {
              name: "Manage Resources",
              href: "/dashboard/admin/resources",
              icon: Settings2,
            },
            {
              name: "Manage Categories",
              href: "/dashboard/admin/categories",
              icon: FolderKanban,
            },
          ]
        : []),
    ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg md:hidden"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B1730] text-white shadow-xl transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-900/30">
              R
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight">
                Reserve<span className="text-cyan-400">Hub</span>
              </p>
              <p className="text-[10px] font-medium tracking-widest text-slate-400">
                WORKSPACE
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-5 pb-3 pt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1.5 px-3"
        >
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={2} />

                <span className="flex-1">{item.name}</span>

                {active && (
                  <ChevronRight size={16} className="text-blue-100" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs font-semibold text-slate-200">
              ReserveHub
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Resource Reservation Management System
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
