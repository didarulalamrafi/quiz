"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Certificate from "@/components/Certificate";

const API = process.env.NEXT_PUBLIC_API;
const MY_RESULT_ENDPOINT = `${API}/results/me`;

export default function MyResultPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [status, setStatus] = useState("loading"); // loading | ready | not_found | error
  const [result, setResult] = useState(null);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login");
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (sessionLoading || !session?.user) return;

    const load = async () => {
      try {
        const res = await fetch(MY_RESULT_ENDPOINT, {
          credentials: "include", // কুকি পাঠানোর জন্য — backend এখন এটা দিয়েই userId বের করবে
        });

        if (res.status === 404) {
          setStatus("not_found");
          return;
        }

        if (!res.ok) {
          let serverMsg = "";
          try {
            const errBody = await res.json();
            serverMsg =
              errBody?.message || errBody?.error || JSON.stringify(errBody);
          } catch {
            serverMsg = await res.text().catch(() => "");
          }
          console.error(`Failed to load result: ${res.status}`, serverMsg);
          setErrorDetail(serverMsg);
          throw new Error("Failed to load result");
        }

        const data = await res.json();
        setResult(data);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    load();
  }, [sessionLoading, session]);

  if (sessionLoading || !session?.user || status === "loading") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-neutral-500 text-sm">
        লোড হচ্ছে...
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border border-neutral-200 bg-white text-center">
        <AlertCircle className="mx-auto text-amber-500" size={36} />
        <h2 className="mt-3 text-lg font-semibold text-neutral-900">
          এখনো কোনো রেজাল্ট পাওয়া যায়নি
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          পরীক্ষা সম্পন্ন করলে এখানে আপনার রেজাল্ট ও সার্টিফিকেট দেখতে পাবেন।
        </p>
        <button
          onClick={() => router.push("/quiz")}
          className="mt-5 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition"
        >
          পরীক্ষা দিতে যান
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-center">
        <XCircle className="mx-auto mb-2" size={28} />
        <p>রেজাল্ট লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
        {errorDetail && (
          <p className="mt-2 text-xs text-red-400 break-words">
            ({errorDetail})
          </p>
        )}
      </div>
    );
  }

  const percent = result?.total
    ? Math.round((result.score / result.total) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 mb-6 text-center">
        <p className="text-sm text-neutral-500">আপনার প্রাপ্ত নম্বর</p>
        <p className="mt-1 text-3xl font-bold text-neutral-900">
          {result.score} / {result.total}{" "}
          <span className="text-lg font-medium text-neutral-400">
            ({percent}%)
          </span>
        </p>
      </div>

      {/* <Certificate result={result} /> */}
    </div>
  );
}
