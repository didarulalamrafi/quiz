import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle"; // তোমার adapter অনুযায়ী
// import { db } from "./db";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET, // এটা prefix ছাড়া, শুধু server এ থাকবে

  trustedOrigins: ["http://localhost:3000", "https://bgc-quiz.vercel.app"],

  // database: drizzleAdapter(db, { provider: "pg" }), // তোমার config বসাও

  emailAndPassword: {
    enabled: true,
  },
});
