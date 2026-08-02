"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { authClient } from "@/lib/auth-client";

function LoginBN() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const userInfo = Object.fromEntries(formData.entries());

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: userInfo.email,
        password: userInfo.password,
      });

      if (error) {
        setFormError(error.message ?? "ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে");
        return;
      }

      router.push("/quiz");
    } catch (err) {
      setFormError("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#e7e9ee] shadow-[0_12px_32px_rgba(31,36,48,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3f4657] px-7 py-6">
          <h1 className="text-white text-lg font-bold m-0">লগইন করুন</h1>
          <p className="text-[#c7cbd6] text-sm mt-1 mb-0">
            কুইজ দিতে আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        <Form className="px-7 py-7" onSubmit={onSubmit}>
          <Fieldset>
            <FieldGroup className="gap-5">
              <TextField isRequired name="email" type="email">
                <Label className="font-semibold text-[#1f2430]">ইমেইল</Label>
                <Input
                  placeholder="you@example.com"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              <TextField isRequired name="password" type="password">
                <Label className="font-semibold text-[#1f2430]">
                  পাসওয়ার্ড
                </Label>
                <Input
                  placeholder="••••••••"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              <div className="flex justify-end -mt-2">
                <a
                  href="/forgot-password"
                  className="text-[13px] text-[#3f4657] font-semibold underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </a>
              </div>

              {formError && (
                <p className="text-sm text-red-500 m-0" role="alert">
                  {formError}
                </p>
              )}
            </FieldGroup>

            <Fieldset.Actions className="mt-2">
              <Button
                type="submit"
                isDisabled={isSubmitting}
                className="w-full rounded-full bg-[#d4a24c] hover:bg-[#c4923f] text-white font-bold py-2.5"
              >
                {isSubmitting ? "লগইন হচ্ছে..." : "লগইন করুন"}
              </Button>
            </Fieldset.Actions>

            <p className="text-center text-[13px] text-[#6b7280] mt-5">
              অ্যাকাউন্ট নেই?{" "}
              <a
                href="/register"
                className="text-[#3f4657] font-bold underline"
              >
                রেজিস্ট্রেশন করুন
              </a>
            </p>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginBN />;
}
