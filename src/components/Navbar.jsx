"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  // NOTE: assumes your better-auth user schema has a `role` field
  // (e.g. "admin" / "user"). If yours is named differently, change
  // `session?.user?.role` below to match.
  const { data: session, isPending } = authClient.useSession();

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full bg-[#0B121F] text-[#F4F1E8] border-b border-white/10">
      <div className="max-w-[1080px] mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-[16px] sm:text-[19px] font-bold tracking-tight whitespace-nowrap">
            <span className="text-[#F4F1E8] text-2xl">BGC</span>
            <span className="text-[#D3A54D] text-2xl">quiz</span>
          </span>
        </Link>

        {/* Nav links — centered in the middle space */}
        <nav className="flex items-center justify-center gap-3.5 sm:gap-6 text-[16px] sm:text-[14px] text-[#B9BFD1] flex-1 min-w-0">
          <Link
            href="/"
            className="hover:text-[#F4F1E8] transition-colors whitespace-nowrap"
          >
            হোম
          </Link>

          {/* Quiz — only visible once logged in */}
          {isLoggedIn && (
            <Link
              href="/quiz"
              className="hover:text-[#F4F1E8] transition-colors whitespace-nowrap"
            >
              কুইজ
            </Link>
          )}

          {/* Result — only visible to admin */}
          {isAdmin && (
            <Link
              href="/result"
              className="hover:text-[#F4F1E8] transition-colors whitespace-nowrap"
            >
              ফলাফল
            </Link>
          )}
        </nav>

        {/* Right side — auth state */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isPending ? (
            <div className="w-16 sm:w-20 h-7 sm:h-8 rounded-full bg-white/5 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* avatar + name */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/15 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D3A54D] text-[#0B121F] flex items-center justify-center text-[12px] sm:text-[13px] font-bold shrink-0">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
                <span className="hidden md:inline text-[13px] text-[#F4F1E8] max-w-[100px] truncate">
                  {session.user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-[11.5px] sm:text-[13px] font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15 text-[#F4F1E8] hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                লগআউট
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="text-[11.5px] sm:text-[13px] text-[#B9BFD1] hover:text-[#F4F1E8] transition-colors whitespace-nowrap"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                className="text-[11.5px] sm:text-[13px] font-bold px-2.5 sm:px-4 py-1.5 rounded-full bg-[#D3A54D] text-[#0B121F] hover:bg-[#c4953f] transition-colors whitespace-nowrap"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
