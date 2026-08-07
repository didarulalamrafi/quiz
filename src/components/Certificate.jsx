"use client";

import { useRef, useState } from "react";
import { Download, Award } from "lucide-react";
import Image from "next/image";

// ============================================================
// সার্টিফিকেট কম্পোনেন্ট
// ------------------------------------------------------------
// - html2canvas দিয়ে সার্টিফিকেটের DOM কে ইমেজে রেন্ডার করি
// - তারপর jsPDF দিয়ে সেই ইমেজ থেকে A4 PDF বানিয়ে ডাউনলোড করাই
//
// ⚠️ ফিক্স: সার্টিফিকেটের ভেতরে কোনো Tailwind কালার ক্লাস (text-amber-600,
// border-neutral-400 ইত্যাদি) ব্যবহার করা হয়নি — এগুলো নতুন Tailwind এ
// oklch() কালার জেনারেট করে, যেটা html2canvas পার্স করতে পারে না এবং
// "সার্টিফিকেট তৈরি করতে সমস্যা হয়েছে" এরর দেয়। তাই সব কালার এখানে
// সরাসরি inline hex style দিয়ে বসানো হলো।
//
// ইনস্টল করতে হবে:
//   npm install jspdf html2canvas
// ============================================================

const EXAM_TITLE = "Seerah Study and Competition"; // তোমার পরীক্ষার নাম বসাও
const ORG_NAME = "Your Organization Name"; // তোমার প্রতিষ্ঠানের নাম বসাও
const PASS_PERCENT = 40;

const colors = {
  gold: "#b8860b",
  goldSoft: "#c99a2e66",
  dark: "#1a1a1a",
  gray500: "#737373",
  gray400: "#a3a3a3",
  gray600: "#525252",
};

export default function Certificate({ result }) {
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const percent = result?.total
    ? Math.round((result.score / result.total) * 100)
    : 0;
  const passed = percent >= PASS_PERCENT;

  const downloadCertificate = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      // A4 ল্যান্ডস্কেপ — পুরো পেজ জুড়ে বসবে
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(
        `certificate-${(result?.name || "student").replace(/\s+/g, "_")}.pdf`,
      );
    } catch (err) {
      console.error("Certificate download failed", err);
      alert("সার্টিফিকেট তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  if (!result) return null;

  return (
    <div>
      {/* ----- সার্টিফিকেট ডিজাইন — A4 landscape রেশিওতে (297mm x 210mm) ----- */}
      <div
        ref={certRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1111px", // A4 landscape @ 96dpi (297mm)
          aspectRatio: "280 / 190",
          backgroundColor: "#ffffff",
          fontFamily: "Georgia, 'Times New Roman', serif",
          margin: "0 auto",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        {/* ডাবল বর্ডার */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `6px double ${colors.gold}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "14px",
            border: `1px solid ${colors.goldSoft}`,
          }}
        />

        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "center",
            padding: "5% 8%",
          }}
        >
          {/* টাইটেল */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Award color={colors.gold} size={36} />
            <h1
              style={{
                marginTop: "6px",
                fontSize: "clamp(20px, 3vw, 32px)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: colors.dark,
              }}
            >
              CERTIFICATE OF {passed ? "COMPLETION" : "PARTICIPATION"}
            </h1>
            <p
              style={{
                marginTop: "4px",
                fontSize: "clamp(10px, 1.1vw, 13px)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: colors.gray500,
              }}
            >
              {EXAM_TITLE}
            </p>
          </div>

          {/* মূল বডি */}
          <div>
            <p
              style={{
                fontSize: "clamp(10px, 1.1vw, 13px)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.gray500,
              }}
            >
              This is to certify that
            </p>
            <h2
              style={{
                marginTop: "12px",
                fontSize: "clamp(26px, 4vw, 44px)",
                color: colors.dark,
                fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
              }}
            >
              {result.name || "Student Name"}
            </h2>
            <div
              style={{
                margin: "4px auto 0",
                height: "1px",
                width: "220px",
                backgroundColor: colors.gray400,
              }}
            />

            <p
              style={{
                marginTop: "16px",
                fontSize: "clamp(11px, 1.3vw, 15px)",
                color: colors.gray600,
                maxWidth: "560px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              has successfully {passed ? "completed" : "participated in"} the{" "}
              <span style={{ fontWeight: 700, color: colors.dark }}>
                {EXAM_TITLE}
              </span>
              , organized by{" "}
              <span style={{ fontWeight: 700, color: colors.dark }}>
                {ORG_NAME}
              </span>
              , achieving a score of{" "}
              <span style={{ fontWeight: 700, color: colors.dark }}>
                {result.score}
              </span>
              .
            </p>

            {(result.institute || result.class) && (
              <p
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: colors.gray400,
                }}
              >
                {result.institute}
                {result.class ? ` · ${result.class}` : ""}
              </p>
            )}
          </div>

          {/* ফুটার — তারিখ / প্রতিষ্ঠানের নাম / সিগনেচার লাইন */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
              fontSize: "clamp(9px, 1vw, 12px)",
              color: colors.gray600,
            }}
          >
            <div style={{ textAlign: "center", width: "140px" }}>
              <p>
                {result.submittedAt
                  ? new Date(result.submittedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("en-GB")}
              </p>
              <div
                style={{
                  marginTop: "4px",
                  borderTop: `1px solid ${colors.gray400}`,
                  paddingTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Date
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                color: colors.gray400,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {ORG_NAME}
            </div>

            <div style={{ textAlign: "center", width: "160px" }}>
              <div style={{ height: "40px" }}>
                <Image
                  className="bg-transparent"
                  src="https://i.ibb.co/WpKLqCFC/Signature.png"
                  alt="Signature"
                  height={40}
                  width={120}
                />
              </div>

              <div
                style={{
                  marginTop: "4px",
                  borderTop: `1px solid ${colors.gray400}`,
                  paddingTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Signature
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----- ডাউনলোড বাটন ----- */}
      <button
        onClick={downloadCertificate}
        disabled={downloading}
        className="mt-5 mx-auto flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50"
      >
        <Download size={16} />
        {downloading ? "তৈরি হচ্ছে..." : "সার্টিফিকেট ডাউনলোড করুন"}
      </button>
    </div>
  );
}
