"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, AlertCircle, UserPlus } from "lucide-react";
import { signUp } from "@/lib/actions/auth";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, null);

  return (
    <div className="min-h-[calc(100vh-64px-73px)] flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #bb86fc 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-surface rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Sparkles className="w-5 h-5 text-[#bb86fc]" />
              <span className="font-display text-3xl text-[#bb86fc] tracking-widest leading-none">
                CALM
              </span>
            </Link>
            <h1 className="font-heading font-bold text-[#f2eef8] text-xl mt-4">
              Create your account
            </h1>
            <p className="text-[#9490a8] font-ui text-sm mt-1">
              Start tracking your manhwa library
            </p>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/25 text-[#f87171] text-sm font-ui mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {state.error}
            </div>
          )}

          {/* Form */}
          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-[#9490a8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5670]" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-[#1a1a25] border border-white/8 rounded-lg pl-9 pr-4 py-2.5 text-sm font-ui text-[#f2eef8] placeholder-[#5a5670] outline-none focus:border-[#bb86fc]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#9490a8] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5670]" />
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="w-full bg-[#1a1a25] border border-white/8 rounded-lg pl-9 pr-4 py-2.5 text-sm font-ui text-[#f2eef8] placeholder-[#5a5670] outline-none focus:border-[#bb86fc]/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#bb86fc] text-[#0c0c12] font-heading font-bold text-sm rounded-lg hover:bg-[#c99ffc] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(187,134,252,0.35)] active:scale-[0.98] mt-2"
            >
              {pending ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {pending ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm font-ui text-[#9490a8] mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#bb86fc] hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
