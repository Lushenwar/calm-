import { createClient } from "@/lib/supabase/server";
import { getLibrary } from "@/lib/actions/library";
import { LibraryClient } from "@/components/library/library-client";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-5xl text-[#f2eef8] tracking-wide leading-none mb-2">
          My <span className="text-[#bb86fc]">Library</span>
        </h1>
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a1a25] border border-white/5 flex items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-[#5a5670]" />
          </div>
          <h2 className="font-heading font-bold text-[#f2eef8] text-lg mb-2">
            Sign in to access your library
          </h2>
          <p className="text-[#9490a8] font-ui text-sm max-w-xs mb-6">
            Your reading list, chapter progress, and tracking data are saved to
            your account.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <button className="px-5 py-2.5 bg-[#bb86fc] text-[#0c0c12] font-heading font-bold text-sm rounded-lg hover:bg-[#c99ffc] transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-5 py-2.5 bg-[#13131a] border border-white/10 text-[#f2eef8] font-heading font-medium text-sm rounded-lg hover:bg-[#1a1a25] transition-all">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const library = await getLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl text-[#f2eef8] tracking-wide leading-none mb-2">
          My <span className="text-[#bb86fc]">Library</span>
        </h1>
        <p className="text-[#9490a8] font-ui text-sm">
          {library.length} series tracked &middot;{" "}
          <span className="text-[#5a5670]">{user.email}</span>
        </p>
      </div>
      <LibraryClient initialLibrary={library} />
    </div>
  );
}
