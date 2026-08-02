"use client";

import { useState, useRef } from "react";
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

function RegisterBN() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const userInfo = Object.fromEntries(formData.entries());

    setIsSubmitting(true);
    try {
      // convert the photo to base64 so it can be saved directly on the
      // user record via better-auth's built-in `image` field — no
      // separate storage service needed
      let imageBase64 = undefined;
      if (photoFile) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }

      // 1) create the account (email/password only — Google/Facebook
      // login can't collect institute/class/phone, so we don't offer it here)
      const { error: signUpError } = await authClient.signUp.email({
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
        image: imageBase64,
        phone: userInfo.phone,
        institute: userInfo.institute,
        class: userInfo.class,
      });

      if (signUpError) {
        setFormError(signUpError.message ?? "অ্যাকাউন্ট তৈরি করা যায়নি");
        return;
      }

      // 2) log the user in right away
      const { error: signInError } = await authClient.signIn.email({
        email: userInfo.email,
        password: userInfo.password,
      });

      if (signInError) {
        setFormError(
          signInError.message ?? "লগইন করা যায়নি, আবার চেষ্টা করুন",
        );
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
          <h1 className="text-white text-lg font-bold m-0">
            কুইজে অংশ নিতে রেজিস্ট্রেশন করুন
          </h1>
        </div>

        <Form className="px-7 py-7" onSubmit={onSubmit}>
          <Fieldset>
            <FieldGroup className="gap-5">
              {/* Photo upload — nicer version */}
              <div className="flex items-center gap-4 pb-1">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-[#d4a24c] bg-[#fbf3e3] flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#d4a24c]/50"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="প্রোফাইল ছবি"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#d4a24c]"
                      >
                        <path
                          d="M12 8v8M8 12h8"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                  {/* small camera badge */}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3f4657] flex items-center justify-center border-2 border-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="13"
                        r="3"
                        stroke="white"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white border border-[#e7e9ee] shadow flex items-center justify-center text-[#6b7280] text-xs leading-none"
                      aria-label="ছবি সরান"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#6b7280]">
                    প্রোফাইল ছবি{" "}
                    <span className="text-[#9aa0ac]">
                      (ঐচ্ছিক, বাধ্যতামূলক নয়)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[13px] font-semibold text-[#3f4657] underline text-left w-fit"
                  >
                    {photoPreview ? "ছবি পরিবর্তন করুন" : "ছবি যোগ করুন"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <TextField
                isRequired
                name="name"
                validate={(value) =>
                  value.length < 3 ? "নাম কমপক্ষে ৩ অক্ষরের হতে হবে" : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">পুরো নাম</Label>
                <Input
                  placeholder="যেমনঃ রাকিব হাসান"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              <TextField isRequired name="email" type="email">
                <Label className="font-semibold text-[#1f2430]">ইমেইল</Label>
                <Input
                  placeholder="you@example.com"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              <TextField
                isRequired
                name="phone"
                validate={(value) =>
                  !/^01[0-9]{9}$/.test(value)
                    ? "সঠিক মোবাইল নম্বর দিন (যেমনঃ 01XXXXXXXXX)"
                    : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">
                  মোবাইল নম্বর
                </Label>
                <Input
                  placeholder="01XXXXXXXXX"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              <div className="grid grid-cols-2 gap-3">
                <TextField isRequired name="institute">
                  <Label className="font-semibold text-[#1f2430]">
                    প্রতিষ্ঠানের নাম
                  </Label>
                  <Input
                    placeholder="স্কুল / কলেজের নাম"
                    className="rounded-xl bg-[#f6f7f9] border-transparent"
                  />
                  <FieldError />
                </TextField>

                <TextField isRequired name="class">
                  <Label className="font-semibold text-[#1f2430]">শ্রেণি</Label>
                  <Input
                    placeholder="যেমনঃ দশম"
                    className="rounded-xl bg-[#f6f7f9] border-transparent"
                  />
                  <FieldError />
                </TextField>
              </div>

              <TextField
                isRequired
                name="password"
                type="password"
                validate={(value) =>
                  value.length < 6
                    ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
                    : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">
                  পাসওয়ার্ড
                </Label>
                <Input
                  placeholder="••••••••"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

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
                {isSubmitting
                  ? "অ্যাকাউন্ট তৈরি হচ্ছে..."
                  : "রেজিস্ট্রেশন করুন"}
              </Button>
            </Fieldset.Actions>

            <p className="text-center text-[13px] text-[#6b7280] mt-5">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <a href="/login" className="text-[#3f4657] font-bold underline">
                লগইন করুন
              </a>
            </p>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterBN />;
}
