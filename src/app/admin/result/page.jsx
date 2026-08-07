"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldOff, ArrowUpDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ============================================================
// ⚙️ CONFIG
// ============================================================
const API = process.env.NEXT_PUBLIC_API;
// 🆕 এই এন্ডপয়েন্ট শুধু admin এর জন্য — ব্যাকএন্ডে অবশ্যই server-side এ
// চেক করতে হবে যে রিকোয়েস্ট করা ইউজারের role === "admin", নাহলে যে
// কেউ URL সরাসরি কল করে সবার রেজাল্ট দেখে ফেলতে পারবে। এই পেজের
// client-side চেকটা শুধু UX এর জন্য, security এর জন্য না।
const ALL_RESULTS_ENDPOINT = `${API}/results`;

// ------------------------------------------------------------------
// 🆕 admin কে চেনার উপায় — session.user.role === "admin" ধরে নিচ্ছি।
// তোমার auth সিস্টেমে (better-auth) user মডেলে role ফিল্ড না থাকলে
// সেটা যোগ করতে হবে এবং সাইনআপের সময় ডিফল্ট "student" সেট করতে হবে।
// role ফিল্ডের নাম আলাদা হলে নিচের ADMIN_CHECK ফাংশনটা পাল্টে দাও।
// ------------------------------------------------------------------
const isAdmin = (user) => user?.role === "admin";

export default function AdminResultsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt"); // "name" | "score" | "submittedAt"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"

  // লগইন + admin গার্ড
  useEffect(() => {
    if (sessionLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!isAdmin(session.user)) {
      router.push("/"); // admin না হলে হোমপেজে পাঠিয়ে দাও
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (sessionLoading || !session?.user || !isAdmin(session.user)) return;

    const load = async () => {
      try {
        const res = await fetch(ALL_RESULTS_ENDPOINT, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load results");
        const data = await res.json();
        // প্রত্যাশিত ফরম্যাট: [{ userId, name, email, phone, institute,
        //   class, score, total, submittedAt, autoSubmitted, autoSubmitReason }, ...]
        setResults(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    load();
  }, [sessionLoading, session]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = results;
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.email, r.phone, r.institute, r.class]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q)),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let av, bv;
      if (sortKey === "score") {
        av = a.total ? a.score / a.total : 0;
        bv = b.total ? b.score / b.total : 0;
      } else if (sortKey === "submittedAt") {
        av = new Date(a.submittedAt || 0).getTime();
        bv = new Date(b.submittedAt || 0).getTime();
      } else {
        av = (a.name || "").toLowerCase();
        bv = (b.name || "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [results, query, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (sessionLoading || !session?.user) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-neutral-500 text-sm">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!isAdmin(session.user)) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-center">
        <ShieldOff className="mx-auto mb-2" size={28} />
        এই পেজ দেখার অনুমতি আপনার নেই।
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-neutral-500 text-sm">
        রেজাল্ট লোড হচ্ছে...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-center">
        রেজাল্ট লোড করা যায়নি। এন্ডপয়েন্ট ({ALL_RESULTS_ENDPOINT}) চেক করো।
      </div>
    );
  }

  const avg =
    results.length > 0
      ? (
          results.reduce(
            (sum, r) => sum + (r.total ? r.score / r.total : 0) * 100,
            0,
          ) / results.length
        ).toFixed(1)
      : 0;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            সবার রেজাল্ট
          </h1>
          <p className="text-sm text-neutral-500">
            মোট {results.length} জন সাবমিট করেছেন · গড় স্কোর {avg}%
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ফোন বা প্রতিষ্ঠান দিয়ে খুঁজুন"
            className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <SortableTh
                label="নাম"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <th className="px-4 py-3 font-medium">প্রতিষ্ঠান / শ্রেণি</th>
              <th className="px-4 py-3 font-medium">মোবাইল</th>
              <SortableTh
                label="স্কোর"
                active={sortKey === "score"}
                dir={sortDir}
                onClick={() => toggleSort("score")}
              />
              <SortableTh
                label="সাবমিট সময়"
                active={sortKey === "submittedAt"}
                dir={sortDir}
                onClick={() => toggleSort("submittedAt")}
              />
              <th className="px-4 py-3 font-medium">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((r) => {
              const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
              return (
                <tr
                  key={r.userId || r.email}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {r.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {[r.institute, r.class].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {r.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${pct >= 40 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {r.score}/{r.total}
                    </span>{" "}
                    <span className="text-neutral-400">({pct}%)</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {r.submittedAt
                      ? new Date(r.submittedAt).toLocaleString("bn-BD")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.autoSubmitted ? (
                      <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-xs">
                        অটো-সাবমিট
                        {r.autoSubmitReason === "tab_switch" && " (ট্যাব সুইচ)"}
                        {r.autoSubmitReason === "time_up" && " (সময় শেষ)"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 text-neutral-500 px-2 py-0.5 text-xs">
                        নিজে সাবমিট
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredSorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  কোনো রেজাল্ট পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableTh({ label, active, dir, onClick }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 ${active ? "text-neutral-900" : "text-neutral-500"}`}
      >
        {label}
        <ArrowUpDown
          size={12}
          className={
            active ? (dir === "asc" ? "rotate-180" : "") : "opacity-40"
          }
        />
      </button>
    </th>
  );
}
