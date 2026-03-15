"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Settings, Plus, LayoutDashboard, PhoneCall, BarChart3, Upload } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: PhoneCall },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/import", label: "Import", icon: Upload },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:block border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-500" />
            Cold Call Tracker
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/settings"
              aria-label="Settings"
              className={`p-2 rounded-md transition-colors ${
                pathname === "/settings"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              href="/calls/new"
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> New Call
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile top bar (logo + new call) */}
      <nav className="sm:hidden border-b border-zinc-800 bg-zinc-950">
        <div className="px-4 h-12 flex items-center justify-between">
          <Link href="/" className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-500" />
            CCT
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              aria-label="Settings"
              className={`p-2.5 rounded-md transition-colors ${
                pathname === "/settings"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              href="/calls/new"
              className="p-2.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              aria-label="New Call"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 safe-area-bottom">
        <div className="grid grid-cols-4 h-14">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
