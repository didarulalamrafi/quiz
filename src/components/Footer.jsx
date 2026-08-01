import { Noto_Serif_Bengali, Hind_Siliguri } from "next/font/google";
import Link from "next/link";

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["500", "600"],
  variable: "--font-display",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

function StarMark({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(45 50 50)"
      />
    </svg>
  );
}

const quickLinks = [
  { href: "/", label: "হোম" },
  { href: "/quiz", label: "কুইজ" },
  { href: "/result", label: "ফলাফল" },
];

export default function Footer() {
  return (
    <footer
      className={`${hindSiliguri.className} relative w-full border-t border-white/10 bg-[#0B121F] text-[#F4F1E8] overflow-hidden`}
    >
      {/* halka distinguishing touch — homepage-এর মতো bg না রেখে সামান্য গাঢ়, উপরে thin gold divider + soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[#D3A54D]/60 to-transparent" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[240px] rounded-full opacity-[0.07] blur-[90px]"
        style={{ background: "#D3A54D" }}
      />

      <div className="relative max-w-[1080px] mx-auto px-5 sm:px-6 pt-14 pb-8">
        {/* main grid — মোবাইলে stacked/center, sm+ এ ৩ কলাম */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-center sm:text-left mb-10">
          {/* brand */}
          <div className="flex flex-col items-center sm:items-start gap-2.5">
            <div className="flex items-center gap-2">
              <StarMark className="w-5 h-5 text-[#D3A54D]" />
              <span
                className={`${notoSerifBengali.className} text-[16px] text-[#F4F1E8]`}
              >
                সীরাত পাঠ প্রতিযোগিতা
              </span>
            </div>
            <p className="text-[13px] text-[#8890A6] leading-[1.8] max-w-[240px]">
              চট্টগ্রাম বিভাগের সবার জন্য উন্মুক্ত একটি অনলাইন সীরাত পাঠ
              প্রতিযোগিতা।
            </p>
          </div>

          {/* quick links */}
          <div>
            <h3 className="text-[12px] tracking-wide text-[#D3A54D] mb-4">
              দ্রুত লিংক
            </h3>
            <ul className="flex flex-col items-center sm:items-start gap-2.5 text-[14px] text-[#B9BFD1]">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-[#F4F1E8] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact us */}
          <div>
            <h3 className="text-[12px] tracking-wide text-[#D3A54D] mb-4">
              যোগাযোগ করুন
            </h3>
            <ul className="flex flex-col items-center sm:items-start gap-2.5 text-[14px] text-[#B9BFD1]">
              <li>
                <Link
                  href="https://www.facebook.com/groups/bandarbangc"
                  className="hover:text-[#F4F1E8] transition-colors"
                >
                  Bandarban Govt. College (Unofficial) বান্দরবান সরকারি কলেজ
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:info@example.com"
                  className="hover:text-[#F4F1E8] transition-colors"
                >
                  didarulalamw@gmail.com
                </Link>
              </li>
              <li className="text-[#8890A6]"></li>
            </ul>
          </div>
        </div>

        {/* disclaimer */}
        <p className="text-[12px] leading-[1.8] text-[#8890A6] text-center sm:text-left max-w-[640px] mx-auto sm:mx-0 mb-6">
          প্রতিযোগিতার যাবতীয় নিয়মাবলী কর্তৃপক্ষ যেকোনো সময় পরিবর্তন,
          পরিবর্ধন, সংযোজন, বিয়োজন এবং বাতিল করার অধিকার রাখেন।
        </p>

        {/* bottom bar — copyright + created by */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10 text-[11.5px] text-[#8890A6]/70">
          <p>
            © ২০২৬ সীরাত পাঠ প্রতিযোগিতা — বান্দরবান সরকারি কলেজ (আনঅফিশিয়াল)
          </p>
          <p>
            তৈরি করেছেন{"  "}
            <Link
              href="https://www.facebook.com/DidarulAlamRafi1"
              className="text-[#D3A54D]/80 hover:text-[#D3A54D] transition-colors"
            >
              Didarul Alam Rafi
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
