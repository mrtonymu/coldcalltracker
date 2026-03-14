"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Settings, Plus } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/calls", label: "Calls" },
  { href: "/analytics", label: "Analytics" },
  { href: "/import", label: "Import" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
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
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
            className={`px-2 py-1.5 rounded-md transition-colors ${
              pathname === "/settings"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>
          <Link
            href="/calls/new"
            className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New Call
          </Link>
        </div>
      </div>
    </nav>
  );
}
