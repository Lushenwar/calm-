"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, BookOpen, Sparkles, TrendingUp, Menu, X, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home", icon: TrendingUp },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/ask", label: "Ask AI", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-surface border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="font-display text-3xl text-[#bb86fc] tracking-widest leading-none group-hover:text-white transition-colors">
            CALM
          </span>
          <span className="hidden sm:block text-[10px] font-heading font-medium text-[#5a5670] uppercase tracking-[0.15em] leading-tight">
            Can AI
            <br />
            Locate Manhwa?
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-heading font-medium transition-all ${
                  active
                    ? "bg-[#bb86fc]/15 text-[#bb86fc]"
                    : "text-[#9490a8] hover:text-[#f2eef8] hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div
                key="searchbar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search manhwa..."
                  onBlur={() => setSearchOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(
                        `/ask?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`
                      );
                      setSearchOpen(false);
                    }
                  }}
                  className="w-full bg-[#1a1a25] border border-white/10 rounded-lg px-3 py-1.5 text-sm font-ui text-[#f2eef8] placeholder-[#5a5670] outline-none focus:border-[#bb86fc]/40 transition-colors"
                />
              </motion.div>
            ) : (
              <motion.button
                key="searchbtn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9490a8] hover:text-[#bb86fc] hover:bg-white/5 transition-all"
              >
                <Search className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Auth */}
        <div className="hidden md:block relative">
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-[#bb86fc]/20 border border-[#bb86fc]/30 flex items-center justify-center text-xs font-heading font-bold text-[#bb86fc] hover:bg-[#bb86fc]/30 transition-colors"
              >
                {user.email?.[0].toUpperCase() ?? "U"}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-surface rounded-xl overflow-hidden py-1 shadow-xl shadow-black/40"
                  >
                    <p className="px-3 py-2 text-xs font-ui text-[#5a5670] truncate border-b border-white/5">
                      {user.email}
                    </p>
                    <Link
                      href="/library"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-heading font-medium text-[#9490a8] hover:text-[#f2eef8] hover:bg-white/5 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      My Library
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-heading font-medium text-[#f87171] hover:bg-[#f87171]/10 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#bb86fc]/10 border border-[#bb86fc]/25 rounded-lg text-sm font-heading font-semibold text-[#bb86fc] hover:bg-[#bb86fc]/20 transition-all">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-[#9490a8]"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-heading font-medium transition-all ${
                      active
                        ? "bg-[#bb86fc]/15 text-[#bb86fc]"
                        : "text-[#9490a8] hover:text-[#f2eef8] hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
              {user ? (
                <form action={signOut} className="mt-1">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-heading font-medium text-[#f87171] hover:bg-[#f87171]/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-heading font-semibold text-[#bb86fc] hover:bg-[#bb86fc]/10 transition-all mt-1"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
