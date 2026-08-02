// src/app/result/page.jsx
// Server Component — server-side এ session চেক করে admin না হলে redirect
// করে দেয়, তারপর result data fetch করে render করে।

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // তোমার better-auth server instance

const API = process.env.NEXT_PUBLIC_API;
const RESULTS_ENDPOINT = `${API}/results`;

async function getResults() {
  const res = await fetch(RESULTS_ENDPOINT, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch results");
  }
  return res.json();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ResultPage() {
  // ── admin-only guard ──────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/"); // admin না হলে হোমপেজে ফেরত পাঠাও
  }
  // ─────────────────────────────────────────────────────────────────

  let results = [];
  let loadError = null;

  try {
    results = await getResults();
  } catch (err) {
    loadError =
      "রেজাল্ট লোড করা যায়নি। এক্সপ্রেস সার্ভার চালু আছে কিনা চেক করো।";
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-neutral-900">সব রেজাল্ট</h1>
      <p className="mt-1 text-sm text-neutral-500">
        মোট {results.length} জন পরীক্ষা দিয়েছে
      </p>

      {loadError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {!loadError && results.length === 0 && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          এখনো কেউ পরীক্ষা সাবমিট করেনি।
        </div>
      )}

      {!loadError && results.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">নাম</th>
                <th className="px-4 py-2.5 font-medium">প্রতিষ্ঠান</th>
                <th className="px-4 py-2.5 font-medium">শ্রেণি</th>
                <th className="px-4 py-2.5 font-medium">মোবাইল</th>
                <th className="px-4 py-2.5 font-medium">সাবমিট সময়</th>
                <th className="px-4 py-2.5 font-medium">স্কোর</th>
                <th className="px-4 py-2.5 font-medium">শতাংশ</th>
                <th className="px-4 py-2.5 font-medium">অটো-সাবমিট</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const percent = r.total
                  ? Math.round((r.score / r.total) * 100)
                  : 0;
                return (
                  <tr
                    key={r._id}
                    className="border-t border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2.5 text-neutral-500">{i + 1}</td>
                    <td className="px-4 py-2.5 text-neutral-900 font-medium whitespace-nowrap">
                      {r.name || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">
                      {r.institute || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">
                      {r.class || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700 whitespace-nowrap">
                      {r.phone || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700 whitespace-nowrap">
                      {formatDate(r.submittedAt)}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900">
                      {r.score} / {r.total}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          percent >= 60
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {percent}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {r.autoSubmitted ? "হ্যাঁ (টাইম শেষ)" : "না"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
