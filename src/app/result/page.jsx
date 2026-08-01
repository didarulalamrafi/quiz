// src/app/result/page.jsx
// এটা Server Component (উপরে "use client" নেই), তাই সরাসরি সার্ভারেই fetch
// করে HTML রেন্ডার করে ব্রাউজারে পাঠাবে — এক্সট্রা loading state লাগবে না।

// নিজের এক্সপ্রেস সার্ভারের ঠিকানা — QuizExam.jsx তে যেটা ব্যবহার করেছো সেটাই
const API = process.env.NEXT_PUBLIC_API;
const RESULTS_ENDPOINT = `${API}/results`;

async function getResults() {
  const res = await fetch(RESULTS_ENDPOINT, {
    cache: "no-store", // সবসময় সর্বশেষ রেজাল্ট আনার জন্য, ক্যাশ না করে
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
  let results = [];
  let loadError = null;

  try {
    results = await getResults();
  } catch (err) {
    // সার্ভার (localhost:5000) বন্ধ থাকলে বা এরর দিলে এখানে ধরা পড়বে
    loadError =
      "রেজাল্ট লোড করা যায়নি। এক্সপ্রেস সার্ভার (localhost:5000) চালু আছে কিনা চেক করো।";
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
                    <td className="px-4 py-2.5 text-neutral-700">
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

// ⚠️ নোট: এখন এই পেজ কে-ই সাবমিট করেছে সেই নাম/আইডি দেখাচ্ছে না, কারণ
// QuizExam.jsx এখন কোনো নাম নেয় না। কে কোন রেজাল্ট সেটা আলাদা করতে চাইলে
// বলো — কুইজ শুরুর আগে নাম/রোল নেওয়ার একটা ছোট ফর্ম যোগ করে দিতে পারি,
// আর সার্ভারেও সেটা answers এর সাথে সেভ করে এই টেবিলে একটা কলাম যোগ করে দিব।
