"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, ShieldAlert, CheckCircle2, Lock } from "lucide-react";

// ============================================================
// ⚙️ CONFIG — নিজের সার্ভারের এন্ডপয়েন্ট এখানে বসাও
// ============================================================
const API = process.env.NEXT_PUBLIC_API;
const QUESTIONS_ENDPOINT = `${API}/quiz`; // 50 টা MCQ এখান থেকে fetch হবে
const SUBMIT_ENDPOINT = `${API}/quiz/submit`; // উত্তর সাবমিট এখানে POST হবে
// ⚠️ দুইটাই একই সার্ভারে (localhost:5000) যাচ্ছে কিনা খেয়াল রাখো —
// একটা পুরো URL আর একটা শুধু path দিলে সাবমিট ভুল জায়গায় চলে যাবে
const EXAM_DURATION_SECONDS = 30 * 60; // ৪. ৩০ মিনিট টাইমার

// ------------------------------------------------------------------
// ৭. "question randomization" — প্রতিবার exam শুরু হলে প্রশ্নের অর্ডার
// এবং প্রতিটা প্রশ্নের option অর্ডার এলোমেলো করে দিচ্ছি, যাতে পাশের
// জনের স্ক্রিনে একই প্রশ্ন একই জায়গায় দেখা না যায় (নকল করা কঠিন হয়)।
// চাইলে false করে বন্ধ রাখতে পারো (ডিবাগ/টেস্টিং এর সময়)।
// ------------------------------------------------------------------
const RANDOMIZE_QUESTIONS = true;
const RANDOMIZE_OPTIONS = true;

// ------------------------------------------------------------------
// ৮. "tab switch korle auto submit" — কতবার ট্যাব ছাড়লে/মিনিমাইজ করলে
// ওয়ার্নিং সহ্য করা হবে, তার লিমিট। লিমিট ক্রস করলেই এক্সাম অটো-সাবমিট
// হয়ে যাবে। 0 দিলে প্রথমবার ট্যাব ছাড়লেই সাথে সাথে সাবমিট হয়ে যাবে।
// ------------------------------------------------------------------
const MAX_TAB_WARNINGS = 3;

// Fisher-Yates shuffle — নতুন array রিটার্ন করে, original mutate করে না
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizExam() {
  const [status, setStatus] = useState("idle"); // idle | loading | running | submitted | error
  const [questions, setQuestions] = useState([]);
  // answers = { [questionId]: selectedOptionId }  -> একটা প্রশ্নে একটাই value থাকবে, তাই single-select এমনিই guaranteed
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [current, setCurrent] = useState(0);
  const [tabWarning, setTabWarning] = useState(0);
  const [scoreResult, setScoreResult] = useState(null); // ৬. সাবমিট রেসপন্স থেকে { score, total } এখানে রাখব
  const [autoSubmitReason, setAutoSubmitReason] = useState(null); // ৮. "time_up" | "tab_switch" | null — সাবমিট স্ক্রিনে কারণ দেখানোর জন্য
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);

  // ------------------------------------------------------------------
  // ৫. "quiz start korar sate sate time count start hoiye jabe"
  // -> questions fetch হয়ে "running" স্টেট হওয়ার সাথে সাথেই useEffect
  //    দিয়ে setInterval চালু করে দিচ্ছি। এটাই টাইমার শুরুর জায়গা।
  // ------------------------------------------------------------------
  useEffect(() => {
    if (status !== "running") return;

    startedAtRef.current = startedAtRef.current || Date.now();

    timerRef.current = setInterval(() => {
      // wall-clock থেকে হিসাব করছি যাতে ব্রাউজার ট্যাব inactive/throttled
      // হয়ে গেলেও সময় ভুল না হয়
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const remaining = EXAM_DURATION_SECONDS - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(timerRef.current);
        handleSubmit(true, "time_up"); // ৪. সময় শেষ হলে auto-submit
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ------------------------------------------------------------------
  // কুইজ লোড করা — নিজের সার্ভার থেকে ৫০টা প্রশ্ন আনা
  // ------------------------------------------------------------------
  const startExam = async () => {
    setStatus("loading");
    try {
      const res = await fetch(QUESTIONS_ENDPOINT);
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      // প্রত্যাশিত ফরম্যাট: [{ id, question, options: [{id, text}, ...] }, ...]

      // ৭. এখানে randomize করছি — প্রশ্নের অর্ডার এবং প্রতিটার ভেতরের
      // option অর্ডার। শুধু client-side shuffle (fetch করা ডেটার উপর),
      // তাই সার্ভারের API/DB তে কোনো পরিবর্তন লাগবে না।
      let processedQuestions = RANDOMIZE_QUESTIONS ? shuffleArray(data) : data;

      if (RANDOMIZE_OPTIONS) {
        processedQuestions = processedQuestions.map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }));
      }

      setQuestions(processedQuestions);
      setStatus("running"); // এইখানে status "running" হওয়া মাত্রই উপরের useEffect টাইমার শুরু করে দেবে
    } catch (err) {
      setStatus("error");
    }
  };

  // ------------------------------------------------------------------
  // ১. "only 1 ta select korte parbe" — একটা প্রশ্নের জন্য radio input
  // ব্যবহার করছি (checkbox না) — একই name (question id) এর radio group
  // এ একবারে একটার বেশি বাছা সম্ভবই না, তাই single-select নিশ্চিত।
  // ------------------------------------------------------------------
  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // ------------------------------------------------------------------
  // সাবমিট — ম্যানুয়াল ক্লিকে অথবা টাইম শেষ/ট্যাব-সুইচ লিমিটে auto call হবে
  // reason প্যারামিটার শুধু UI-তে কারণ দেখানোর জন্য, সার্ভারেও পাঠাচ্ছি
  // (চাইলে backend এ log/flag করতে পারবে কেন সাবমিট হলো)
  // ------------------------------------------------------------------
  // 🔧 useCallback সরিয়ে দিলাম — Next.js এর React Compiler নিজে থেকেই
  // মেমোয়াইজেশন করে দেয়, তাই ম্যানুয়াল useCallback আর দরকার নেই এবং
  // এটাই ছিল সেই "Compilation Skipped" warning-এর কারণ।
  const handleSubmit = async (auto = false, reason = null) => {
    clearInterval(timerRef.current);
    if (auto) setAutoSubmitReason(reason);
    setStatus("submitted");
    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          autoSubmitted: auto,
          autoSubmitReason: reason, // "time_up" | "tab_switch" | null
          tabSwitchCount: tabWarning,
        }),
      });
      const data = await res.json();
      // ৬. সার্ভার থেকে { score, total } আসছে, সেটা সেভ করছি "submitted" স্ক্রিনে দেখানোর জন্য
      if (data && typeof data.score === "number") {
        setScoreResult({ score: data.score, total: data.total });
      }
    } catch (err) {
      // নেটওয়ার্ক এরর হলেও UI-তে submitted দেখাচ্ছি, চাইলে retry-logic যোগ করতে পারো
      console.error("Submit failed", err);
    }
  };

  // ------------------------------------------------------------------
  // ২. "text copy kora jabe na" — কপি একদম ১০০% আটকানো ব্রাউজারে
  // সম্ভব না (কেউ devtools/inspect দিয়ে চাইলেই পারবে), কিন্তু সাধারণ
  // ইউজারের জন্য যথেষ্ট শক্ত deterrent দিচ্ছি:
  //   - CSS দিয়ে select করাই বন্ধ (userSelect: none)
  //   - onCopy/onCut/onContextMenu ইভেন্টে preventDefault
  // ------------------------------------------------------------------
  const antiCopyProps = {
    onCopy: (e) => e.preventDefault(),
    onCut: (e) => e.preventDefault(),
    onContextMenu: (e) => e.preventDefault(), // রাইট-ক্লিক মেনুও বন্ধ
    style: { userSelect: "none", WebkitUserSelect: "none" },
  };

  // ------------------------------------------------------------------
  // ৩ + ৮. "screenshot neya jabe na" + "tab switch korle auto submit"
  // সৎভাবে বলে রাখি: ব্রাউজারে সত্যিকারের স্ক্রিনশট ব্লক করার কোনো
  // ওয়েব API নেই (মোবাইল OS/ব্রাউজার নিজের permission ছাড়া JS-কে
  // screenshot capture আটকাতে দেয় না)। যেটা করা যায় সেটা হলো
  // "deterrent + detection":
  //   - ইউজার অন্য ট্যাবে গেলে / উইন্ডো blur হলে ধরে ফেলা (visibilitychange)
  //   - প্রতিবার তা caunt করে warning দেখানো
  //   - MAX_TAB_WARNINGS ক্রস করলে exam নিজে থেকেই auto-submit হয়ে যাবে
  //     (নিচে handleSubmit কে "tab_switch" reason দিয়ে কল করছি)
  // এটা screenshot নিজেই আটকায় না, কিন্তু নকল/অন্য জায়গায় দেখে উত্তর
  // করার প্যাটার্ন এবং বারবার সরে যাওয়া অনেকটা কমায়।
  // ------------------------------------------------------------------
  useEffect(() => {
    if (status !== "running") return;

    const onVisibilityChange = () => {
      if (!document.hidden) return;

      setTabWarning((prev) => {
        const next = prev + 1;
        // পরের রেন্ডারে state আপডেট হওয়ার অপেক্ষা না করে, লিমিট ক্রস
        // করলে সাথে সাথেই এখান থেকে auto-submit ট্রিগার করছি
        if (next > MAX_TAB_WARNINGS) {
          handleSubmit(true, "tab_switch");
        }
        return next;
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ================= UI =================

  if (status === "idle") {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl border border-neutral-200 bg-white text-center">
        <h1 className="text-xl font-semibold text-neutral-900">MCQ পরীক্ষা</h1>
        <p className="mt-2 text-sm text-neutral-500">
          ৫০টি প্রশ্ন · সময় ৩০ মিনিট · শুরু করলে সাথে সাথে টাইমার চালু হয়ে
          যাবে
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          প্রশ্ন ও অপশনের অর্ডার প্রতিবার এলোমেলো থাকে · বারবার ট্যাব ছেড়ে গেলে
          পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে
        </p>
        <button
          onClick={startExam}
          className="mt-6 w-full rounded-lg bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
        >
          পরীক্ষা শুরু করো
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-neutral-500 text-sm">
        প্রশ্ন লোড হচ্ছে...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-center">
        প্রশ্ন লোড করা যায়নি। এন্ডপয়েন্ট ({QUESTIONS_ENDPOINT}) চেক করো।
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl border border-neutral-200 bg-white text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
        <h2 className="mt-3 text-lg font-semibold text-neutral-900">
          সাবমিট সম্পন্ন হয়েছে
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          তোমার উত্তর সংরক্ষণ করা হয়েছে।
        </p>

        {/* ৮. auto-submit হয়ে থাকলে কারণ দেখাচ্ছি, যাতে ইউজার বুঝতে পারে কেন হলো */}
        {autoSubmitReason === "time_up" && (
          <p className="mt-2 text-xs text-amber-600">
            সময় শেষ হওয়ায় পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হয়েছে।
          </p>
        )}
        {autoSubmitReason === "tab_switch" && (
          <p className="mt-2 text-xs text-red-600">
            বারবার ট্যাব পরিবর্তনের কারণে পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট
            হয়েছে।
          </p>
        )}

        {/* ৬. score আসলে সেটা দেখাচ্ছি, না আসলে (নেটওয়ার্ক এরর ইত্যাদি) এই অংশ স্কিপ হয়ে যাবে */}
        {scoreResult && (
          <div className="mt-4 rounded-lg bg-neutral-50 border border-neutral-200 py-3">
            <p className="text-2xl font-bold text-neutral-900">
              {scoreResult.score} / {scoreResult.total}
            </p>
            <p className="text-xs text-neutral-500 mt-1">তোমার স্কোর</p>
          </div>
        )}
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const warningsLeft = Math.max(0, MAX_TAB_WARNINGS - tabWarning);

  return (
    <div className="max-w-2xl mx-auto p-4" {...antiCopyProps}>
      {/* উপরের বার — প্রগ্রেস + টাইমার */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 mb-4">
        <span className="text-sm text-neutral-500">
          প্রশ্ন {current + 1} / {questions.length} · উত্তর দেওয়া হয়েছে{" "}
          {answeredCount}
        </span>
        <div
          className={`flex items-center gap-1.5 text-sm font-semibold ${
            timeLeft <= 60 ? "text-red-600" : "text-neutral-900"
          }`}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ৮. ট্যাব ছাড়ার ওয়ার্নিং — এখন কতবার বাকি আছে সেটাও দেখাচ্ছি, যাতে
          ইউজার বুঝতে পারে আর কতবার সরলে অটো-সাবমিট হয়ে যাবে */}
      {tabWarning > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <ShieldAlert size={14} />
          তুমি {tabWarning} বার ট্যাব ছেড়ে গিয়েছিলে — এই ঘটনা লগ করা হয়েছে।
          আর {warningsLeft} বার সরলে পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।
        </div>
      )}

      {/* প্রশ্ন কার্ড */}
      {q && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="font-medium text-neutral-900">{q.question}</p>
          <div className="mt-4 flex flex-col gap-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition ${
                  answers[q.id] === opt.id
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {/* radio input = single-select, একই name সব option শেয়ার করছে */}
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  className="accent-neutral-900"
                  checked={answers[q.id] === opt.id}
                  onChange={() => selectOption(q.id, opt.id)}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* নেভিগেশন */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-lg px-4 py-2 text-sm border border-neutral-200 disabled:opacity-40"
        >
          আগের প্রশ্ন
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
            className="rounded-lg px-4 py-2 text-sm bg-neutral-900 text-white"
          >
            পরের প্রশ্ন
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm bg-emerald-600 text-white"
          >
            <Lock size={14} />
            সাবমিট করো
          </button>
        )}
      </div>

      {/* প্রশ্ন নাম্বার প্যাড */}
      <div className="mt-4 grid grid-cols-10 gap-1.5">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            onClick={() => setCurrent(i)}
            className={`h-8 rounded text-xs font-medium ${
              i === current
                ? "bg-neutral-900 text-white"
                : answers[qq.id]
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
