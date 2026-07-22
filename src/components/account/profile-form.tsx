"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { updateProfileAction } from "@/app/account/actions";
import { UserAvatar } from "@/components/user-avatar";

export function ProfileForm({
  fullName,
  email,
  phone,
  avatarUrl,
}: {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 max-w-xl space-y-4"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await updateProfileAction(formData);
          setOk(result.ok);
          setMessage(result.message);
          if (result.ok) router.refresh();
        });
      }}
    >
      <div className="flex items-center gap-3">
        <UserAvatar src={avatarUrl} alt={fullName} size={64} className="rounded-full object-cover" />
        <div>
          <p className="m-0 text-sm font-extrabold text-navy">{fullName || "Your profile"}</p>
          <p className="m-0 text-sm text-muted">{email}</p>
        </div>
      </div>

      <label className="grid gap-1.5 text-xs font-extrabold text-[#526177]">
        Full name
        <input
          name="fullName"
          required
          defaultValue={fullName}
          className="rounded-lg border border-[#dce3eb] bg-white p-3 text-sm font-semibold text-navy outline-none"
        />
      </label>

      <label className="grid gap-1.5 text-xs font-extrabold text-[#526177]">
        Email
        <input
          value={email}
          readOnly
          className="rounded-lg border border-[#dce3eb] bg-[#f4f7fa] p-3 text-sm font-semibold text-muted outline-none"
        />
      </label>

      <label className="grid gap-1.5 text-xs font-extrabold text-[#526177]">
        Phone
        <input
          name="phone"
          defaultValue={phone}
          placeholder="03XXXXXXXXX"
          className="rounded-lg border border-[#dce3eb] bg-white p-3 text-sm font-semibold text-navy outline-none"
        />
      </label>

      {message ? (
        <p className={`m-0 text-sm font-semibold ${ok ? "text-[#12805a]" : "text-[#d14343]"}`}>{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange px-5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="animate-spin" size={16} /> : null}
        Save profile
      </button>
    </form>
  );
}
