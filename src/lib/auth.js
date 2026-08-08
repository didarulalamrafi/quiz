import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("Quiz");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,

  // 🆕 ⚠️ baseURL MUST be your Express backend URL
  // Locally: http://localhost:5000
  // Vercel: https://quiz-server-ivory.vercel.app
  baseURL:
    process.env.BETTER_AUTH_URL || "https://quiz-server-ivory.vercel.app",

  trustedOrigins: ["http://localhost:3000", "https://bgc-quiz.vercel.app"],

  cookie: {
    name: "better-auth.session_token",
    sameSite: "none", // ✅ ক্রস-সাইট রিকোয়েস্টের জন্য
    secure: true, // ✅ HTTPS-only (Vercel এ এটা থাকা আবশ্যক)
    path: "/",
    httpOnly: true, // ✅ JavaScript থেকে অ্যাক্সেস করা যাবে না (সিকিউরিটি)
    maxAge: 60 * 60 * 24 * 7, // ৭ দিন
  },

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      institute: {
        type: "string",
        required: false,
      },
      class: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
});
