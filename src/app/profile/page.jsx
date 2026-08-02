"use client";

import { useState, useRef, useEffect } from "react";
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

function Profile() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login");
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (session?.user?.image) setPhotoPreview(session.user.image);
  }, [session?.user?.image]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const userInfo = Object.fromEntries(formData.entries());

    setIsSaving(true);
    try {
      let imageBase64 = session?.user?.image;
      if (photoFile) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });
      }

      // update profile fields (name + image are built-in; phone/institute/class
      // must be registered as additionalFields in your auth.js user schema)
      const { error: updateError } = await authClient.updateUser({
        name: userInfo.name,
        image: imageBase64,
        phone: userInfo.phone,
        institute: userInfo.institute,
        class: userInfo.class,
      });

      if (updateError) {
        setMessage({
          type: "error",
          text: updateError.message ?? "তথ্য পরিবর্তন করা যায়নি",
        });
        return;
      }

      // optional password change
      if (userInfo.newPassword) {
        const { error: passwordError } = await authClient.changePassword({
          currentPassword: userInfo.currentPassword,
          newPassword: userInfo.newPassword,
        });

        if (passwordError) {
          setMessage({
            type: "error",
            text: passwordError.message ?? "পাসওয়ার্ড পরিবর্তন করা যায়নি",
          });
          return;
        }
      }

      setMessage({ type: "success", text: "তথ্য সফলভাবে আপডেট হয়েছে" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (sessionLoading || !session?.user) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <p className="text-[#6b7280] text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#e7e9ee] shadow-[0_12px_32px_rgba(31,36,48,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B121F] px-7 py-6">
          <h1 className="text-white text-lg font-bold m-0">প্রোফাইল তথ্য</h1>
          <p className="text-[#B9BFD1] text-sm mt-1 mb-0">
            আপনার তথ্য আপডেট করুন
          </p>
        </div>

        <Form className="px-7 py-7" onSubmit={onSubmit}>
          <Fieldset>
            <FieldGroup className="gap-5">
              {/* Photo */}
              <div className="flex items-center gap-4 pb-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-[#D3A54D] bg-[#fbf3e3] flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-[1.03]"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="প্রোফাইল ছবি"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#D3A54D] text-2xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </button>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0B121F] flex items-center justify-center border-2 border-white">
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
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#6b7280]">প্রোফাইল ছবি</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[13px] font-semibold text-[#0B121F] underline text-left w-fit"
                  >
                    ছবি পরিবর্তন করুন
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <TextField
                isRequired
                name="name"
                defaultValue={user.name}
                validate={(value) =>
                  value.length < 3 ? "নাম কমপক্ষে ৩ অক্ষরের হতে হবে" : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">পুরো নাম</Label>
                <Input className="rounded-xl bg-[#f6f7f9] border-transparent" />
                <FieldError />
              </TextField>

              <TextField isDisabled name="email" defaultValue={user.email}>
                <Label className="font-semibold text-[#1f2430]">ইমেইল</Label>
                <Input className="rounded-xl bg-[#eceef1] border-transparent text-[#9aa0ac]" />
              </TextField>

              <TextField
                isRequired
                name="phone"
                defaultValue={user.phone}
                validate={(value) =>
                  !/^01[0-9]{9}$/.test(value)
                    ? "সঠিক মোবাইল নম্বর দিন (যেমনঃ 01XXXXXXXXX)"
                    : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">
                  মোবাইল নম্বর
                </Label>
                <Input className="rounded-xl bg-[#f6f7f9] border-transparent" />
                <FieldError />
              </TextField>

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  isRequired
                  name="institute"
                  defaultValue={user.institute}
                >
                  <Label className="font-semibold text-[#1f2430]">
                    প্রতিষ্ঠানের নাম
                  </Label>
                  <Input className="rounded-xl bg-[#f6f7f9] border-transparent" />
                  <FieldError />
                </TextField>

                <TextField isRequired name="class" defaultValue={user.class}>
                  <Label className="font-semibold text-[#1f2430]">শ্রেণি</Label>
                  <Input className="rounded-xl bg-[#f6f7f9] border-transparent" />
                  <FieldError />
                </TextField>
              </div>

              {/* password change — optional */}
              <div className="pt-2 border-t border-[#e7e9ee]">
                <p className="text-[13px] font-semibold text-[#1f2430] mb-3 mt-3">
                  পাসওয়ার্ড পরিবর্তন করুন (ঐচ্ছিক)
                </p>
              </div>

              <TextField name="currentPassword" type="password">
                <Label className="font-semibold text-[#1f2430]">
                  বর্তমান পাসওয়ার্ড
                </Label>
                <Input
                  placeholder="••••••••"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
              </TextField>

              <TextField
                name="newPassword"
                type="password"
                validate={(value) =>
                  value && value.length < 6
                    ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
                    : null
                }
              >
                <Label className="font-semibold text-[#1f2430]">
                  নতুন পাসওয়ার্ড
                </Label>
                <Input
                  placeholder="••••••••"
                  className="rounded-xl bg-[#f6f7f9] border-transparent"
                />
                <FieldError />
              </TextField>

              {message && (
                <p
                  className={`text-sm m-0 ${
                    message.type === "success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                  role="alert"
                >
                  {message.text}
                </p>
              )}
            </FieldGroup>

            <Fieldset.Actions className="mt-2">
              <Button
                type="submit"
                isDisabled={isSaving}
                className="w-full rounded-full bg-[#D3A54D] hover:bg-[#c4953f] text-white font-bold py-2.5"
              >
                {isSaving ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <Profile />;
}
