"use client";
import { Link, Button } from "@heroui/react";

const navLinks = [
  { href: "/quiz", label: "কুইজ" },
  { href: "/result", label: "ফলাফল" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0E1626]/75 backdrop-blur-lg">
      <header className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 max-w-[1080px] mx-auto">
        {/* logo */}
        <Link href="/" className="flex items-center shrink-0">
          <h1 className="text-[15px] sm:text-[17px] font-semibold text-[#F4F1E8]">
            BGC<span className="text-[#D3A54D]">quiz</span>
          </h1>
        </Link>

        {/* nav links — এখন মোবাইলেও সরাসরি দেখা যাবে, hidden/menu লাগছে না */}
        <ul className="flex items-center gap-3 sm:gap-6 md:gap-8">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[12.5px] sm:text-[14px] text-[#B9BFD1] hover:text-[#F4F1E8] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#D3A54D] text-[#0E1626] text-[12px] sm:text-[13.5px] font-medium hover:brightness-110 px-3 sm:px-4"
              >
                রেজিস্ট্রেশন
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/login">
              <Button
                size="sm"
                className="bg-[#D3A54D] text-[#0E1626] text-[12px] sm:text-[13.5px] font-medium hover:brightness-110 px-3 sm:px-4"
              >
                Login
              </Button>
            </Link>
          </li>
        </ul>
      </header>
    </nav>
  );
}
