import { Anek_Bangla, Baloo_Da_2 } from "next/font/google";
import Link from "next/link";

const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const balooDa2 = Baloo_Da_2({
  subsets: ["bengali"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const facts = [
  { k: "ইংরেজি তারিখ", v: "২৬ আগস্ট, ২০২৬" },
  { k: "হিজরি তারিখ", v: "১২ রবিউল আউয়াল, ১৪৪৮" },
  { k: "বার", v: "বুধবার" },
  { k: "পদ্ধতি", v: "সম্পূর্ণ অনলাইন" },
];

const rules = [
  {
    n: "১",
    title: "পরীক্ষার সময়",
    desc: "মোট ৩০ মিনিট সময় পাওয়া যাবে উত্তর দেওয়ার জন্য।",
  },
  {
    n: "২",
    title: "প্রশ্নের সংখ্যা",
    desc: "৫০টি বহুনির্বাচনি (MCQ) প্রশ্ন থাকবে।",
  },
  {
    n: "৩",
    title: "পুরস্কার",
    desc: "শীর্ষ ৩ জনের জন্য আকর্ষণীয় পুরস্কার এবং নির্দিষ্ট সংখ্যক নম্বর প্রাপ্তদের জন্য সান্ত্বনা পুরস্কার।",
  },
];

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
        transform="rotate(0 50 50)"
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

export default function Home() {
  return (
    // ফিক্স ১: root এ overflow-x-hidden — যেকোনো চাইল্ড এলিমেন্ট (glow circle,
    // ornament ইত্যাদি) ভিউপোর্টের বাইরে গেলেও এখন আর horizontal scroll/সাদা
    // স্পেস তৈরি হবে না
    <div
      className={`${anekBangla.className} flex flex-col flex-1 bg-[#0E1626] text-[#F4F1E8] overflow-x-hidden`}
    >
      {/* ambient glow */}
      {/* ফিক্স ২: এই wrapper divটাতেই আসল সমস্যা ছিল — w-[560px]/w-[420px] এর
          glow circle গুলো right-[-10%]/left-[-15%] দিয়ে বাইরে ঠেলে দেওয়া
          হয়েছিল, কিন্তু overflow-hidden না থাকায় সেই এক্সট্রা widthটা পুরো
          পেজের scrollable area বাড়িয়ে দিচ্ছিল। overflow-hidden দিলে গ্লো
          ইফেক্টটা ঠিক আগের মতোই দেখাবে, শুধু বাইরের অংশ clip হয়ে যাবে। */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] w-[560px] h-[560px] rounded-full opacity-[0.14] blur-[110px]"
          style={{ background: "#D3A54D" }}
        />
        <div
          className="pointer-events-none absolute top-10 left-[-15%] w-[420px] h-[420px] rounded-full opacity-[0.10] blur-[100px]"
          style={{ background: "#5FA39A" }}
        />

        {/* header */}
        <header className="relative w-full max-w-[1080px] mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarMark className="w-15 h-15 text-[#D3A54D]" />
            <div>
              <div
                className={`${balooDa2.className} font-bold text-2xl  text-[#F4F1E8]`}
              >
                সীরাত পাঠ প্রতিযোগিতা
              </div>
              <div className=" font-semibold text-xl  text-[#0f46df] mt-0.5">
                <Link href={"https://www.facebook.com/groups/bandarbangc"}>
                  বান্দরবান সরকারি কলেজ (আনঅফিশিয়াল)
                </Link>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#D3A54D] border border-[#D3A54D]/30 rounded-full px-3 py-1">
            ২০২৬
          </span>
        </header>

        {/* hero */}
        <section className="relative w-full max-w-[1080px] mx-auto px-6 pt-16 pb-20 grid md:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
          <div>
            <span className="inline-block text-[16px] tracking-wide text-[#D3A54D] mb-5">
              ২য় বারের মতো সম্পূর্ণ অনলাইনে
            </span>
            <h1
              className={`${balooDa2.className} text-[#F9F7F0] leading-[1.3] mb-6`}
              style={{ fontSize: "clamp(32px, 4.6vw, 50px)" }}
            >
              সীরাত পাঠ
              <br />
              প্রতিযোগিতা ২০২৬
            </h1>
            <p className="text-[16px] leading-[1.9] text-[#B9BFD1] max-w-[480px] mb-9">
              সর্বকালের সর্বশ্রেষ্ঠ মহামানব, বিশ্ব মানবতার মুক্তিদূত{" "}
              <span className="text-[#F4F1E8]">
                হযরত মুহাম্মদ (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম)
              </span>{" "}
              -এর মহিমান্বিত জীবনী সম্পর্কে জানার এবং নিজের জ্ঞানকে ঝালিয়ে
              নেওয়ার এক দারুণ সুযোগ।
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/register"
                className="inline-block px-7 py-3 rounded-md text-[14.5px] font-medium bg-[#D3A54D] text-[#0E1626] hover:brightness-110 transition"
              >
                রেজিস্ট্রেশন করুন
              </a>
              <a
                href="#rules"
                className="inline-block px-7 py-3 rounded-md text-[14.5px] font-medium border border-white/15 text-[#F4F1E8] hover:border-white/30 transition"
              >
                নিয়মাবলী দেখুন
              </a>
            </div>
          </div>

          {/* signature ornament */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-[280px] h-[280px] rounded-full opacity-20 blur-[60px]"
              style={{ background: "#D3A54D" }}
            />
            <StarMark className="relative w-[240px] h-[240px] text-[#D3A54D]/70" />
            <StarMark className="absolute w-[150px] h-[150px] text-[#5FA39A]/60" />
          </div>
        </section>
      </div>

      {/* quick facts — constellation strip */}
      <section className="relative w-full max-w-[1080px] mx-auto px-6 pb-24">
        <div className="relative border-t border-white/10 pt-10 grid grid-cols-2 md:grid-cols-4 gap-y-15">
          {facts.map((f) => (
            <div key={f.k} className="relative text-center px-5">
              <span className="block w-2 h-2 rounded-full bg-[#D3A54D] mx-auto mb-4 -mt-[45px]" />
              <div className="text-[14px] text-[#8890A6] mb-1">{f.k}</div>
              <div className="text-[16px] font-medium text-[#F4F1E8]">
                {f.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* syllabus */}
      <section className="w-full max-w-[1080px] mx-auto px-6 py-16 grid md:grid-cols-[220px_1fr] gap-10 border-t border-white/10">
        <div>
          <span className="text-[13px] tracking-wide text-[#D3A54D]">
            প্রস্তুতি
          </span>
          <h2
            className={`${balooDa2.className} text-[24px] text-[#F9F7F0] mt-2`}
          >
            সিলেবাস
          </h2>
        </div>
        <div>
          <p className="text-[15px] text-[#B9BFD1] leading-[1.9] max-w-[560px] mb-6">
            নির্দিষ্ট কোনো বই বাধ্যতামূলক নয় — যেকোনো নির্ভরযোগ্য সীরাত গ্রন্থ
            থেকেই প্রস্তুতি নেওয়া যাবে।
          </p>
          <div className="flex items-start gap-3 py-4 border-t border-white/10">
            <StarMark className="w-3.5 h-3.5 mt-1 text-[#5FA39A] shrink-0" />
            <span className="text-[15px] text-[#F4F1E8]">
              যেকোনো প্রামাণ্য সীরাত গ্রন্থ থেকে প্রস্তুতি নেওয়া যাবে
            </span>
          </div>
          <div className="flex items-start gap-3 py-4 border-t border-white/10">
            <StarMark className="w-3.5 h-3.5 mt-1 text-[#5FA39A] shrink-0" />
            <span className="text-[15px] text-[#F4F1E8]">
              আর-রাহিকুল মাখতুম গ্রন্থটি পড়া শ্রেয়{" "}
              <span className="inline-block text-[11.5px] text-[#D3A54D] border border-[#D3A54D]/30 rounded-full px-2.5 py-0.5 ml-1 align-middle">
                প্রস্তাবিত
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* eligibility — pull quote */}
      <section className="w-full max-w-[760px] mx-auto px-6 py-20 text-center border-t border-white/10">
        <span className="text-[13px] tracking-wide text-[#D3A54D]">
          অংশগ্রহণের যোগ্যতা
        </span>
        <p
          className={`${balooDa2.className} text-[22px] md:text-[26px] leading-[1.7] text-[#F4F1E8] mt-4`}
        >
          চট্টগ্রাম বিভাগের অন্তর্গত জাতি, ধর্ম ও বর্ণ নির্বিশেষে সবার জন্য
          উন্মুক্ত।
        </p>
      </section>

      {/* rules — vertical timeline */}
      <section
        id="rules"
        className="w-full max-w-[1080px] mx-auto px-6 py-16 border-t border-white/10"
      >
        <span className="text-[13px] tracking-wide text-[#D3A54D]">
          নিয়মাবলী
        </span>
        <h2
          className={`${balooDa2.className} text-[24px] text-[#F9F7F0] mt-2 mb-10`}
        >
          প্রতিযোগিতার নিয়ম
        </h2>

        <div className="relative max-w-[620px]">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/10" />
          {rules.map((r, i) => (
            <div
              key={r.n}
              className={`relative flex gap-6 pl-0 ${i !== rules.length - 1 ? "pb-10" : ""}`}
            >
              <span className="relative z-10 w-9 h-9 rounded-full border border-[#D3A54D]/40 bg-[#0E1626] flex items-center justify-center shrink-0">
                <span
                  className={`${balooDa2.className} text-[14px] text-[#D3A54D]`}
                >
                  {r.n}
                </span>
              </span>
              <div className="pt-1">
                <h3 className="text-[15.5px] font-medium text-[#F4F1E8] mb-1.5">
                  {r.title}
                </h3>
                <p className="text-[14px] text-[#B9BFD1] leading-[1.8]">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* prizes */}
      <section className="w-full max-w-[1080px] mx-auto px-6 py-16 border-t border-white/10">
        <span className="text-[13px] tracking-wide text-[#D3A54D]">
          পুরস্কার
        </span>
        <h2
          className={`${balooDa2.className} text-[24px] text-[#F9F7F0] mt-2 mb-10`}
        >
          বিজয়ীদের জন্য
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { rank: "১ম", label: "শীর্ষ স্থান অধিকারী" },
            { rank: "২য়", label: "দ্বিতীয় স্থান অধিকারী" },
            { rank: "৩য়", label: "তৃতীয় স্থান অধিকারী" },
          ].map((p) => (
            <div key={p.rank} className="text-center py-8 md:py-0 md:px-8">
              <StarMark className="w-4 h-4 text-[#D3A54D] mx-auto mb-4" />
              <div
                className={`${balooDa2.className} text-[30px] text-[#F9F7F0] mb-2`}
              >
                {p.rank}
              </div>
              <p className="text-[13.5px] text-[#8890A6]">{p.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[13.5px] text-[#8890A6] mt-10 pt-8 border-t border-white/10">
          নির্দিষ্ট পরিমাণ নম্বর প্রাপ্তদের জন্য থাকছে বিশেষ সান্ত্বনা পুরস্কার।
        </p>
      </section>

      {/* closing CTA */}
      <section className="w-full max-w-[1080px] mx-auto px-6 pb-24 pt-4">
        <div className="rounded-2xl border border-[#D3A54D]/25 bg-white/[0.03] px-8 py-12 text-center">
          <h2
            className={`${balooDa2.className} text-[22px] md:text-[26px] text-[#F9F7F0] mb-3`}
          >
            প্রস্তুতি নাও, অংশ নাও
          </h2>
          <p className="text-[14.5px] text-[#B9BFD1] mb-7 max-w-[480px] mx-auto">
            ২৬ আগস্ট, ২০২৬ — বুধবার। রেজিস্ট্রেশন করে আজই নিজের প্রস্তুতি শুরু
            করে দাও।
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 rounded-md text-[14.5px] font-medium bg-[#D3A54D] text-[#0E1626] hover:brightness-110 transition"
          >
            রেজিস্ট্রেশন করুন
          </a>
        </div>
      </section>
    </div>
  );
}
