"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useStoreCart } from "@/providers/store-cart-provider";
import { formatStorePrice, SHIPPING_FEE_PKR } from "@/lib/store/types";

type AddressOption = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  area: string | null;
  streetAddress: string;
  isDefaultShipping: boolean;
};

const fieldClassName =
  "grid gap-[7px] [&>label]:text-xs [&>label]:font-extrabold [&>label]:text-[#526177] [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#dce3eb] [&>input]:bg-white [&>input]:p-3 [&>input]:outline-none [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#dce3eb] [&>select]:bg-white [&>select]:p-3";

export function StoreCheckoutClient({
  signedIn,
  initialProfile,
  initialAddresses,
}: {
  signedIn: boolean;
  initialProfile?: { fullName: string; phone: string } | null;
  initialAddresses?: AddressOption[];
}) {
  const cart = useStoreCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addresses = initialAddresses ?? [];
  const defaultAddress =
    addresses.find((a) => a.isDefaultShipping) || addresses[0] || null;

  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName || initialProfile?.fullName || "",
    phone: defaultAddress?.phone || initialProfile?.phone || "",
    province: defaultAddress?.province || "Sindh",
    city: defaultAddress?.city || "",
    streetAddress: defaultAddress?.streetAddress || "",
    area: defaultAddress?.area || "",
    customerNotes: "",
    saveAddress: true,
  });

  useEffect(() => {
    if (!defaultAddress && !initialProfile) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || defaultAddress?.fullName || initialProfile?.fullName || "",
      phone: prev.phone || defaultAddress?.phone || initialProfile?.phone || "",
      province: prev.province || defaultAddress?.province || "Sindh",
      city: prev.city || defaultAddress?.city || "",
      streetAddress: prev.streetAddress || defaultAddress?.streetAddress || "",
      area: prev.area || defaultAddress?.area || "",
    }));
  }, [defaultAddress, initialProfile]);

  function applyAddress(addressId: string) {
    const address = addresses.find((a) => a.id === addressId);
    if (!address) return;
    setForm((prev) => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      streetAddress: address.streetAddress,
      area: address.area || "",
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent("/store/checkout")}`);
      return;
    }
    if (!cart.items.length) {
      setError("Your cart is empty");
      return;
    }

    const phone = form.phone.trim();
    if (!/^(?:\+92|0)?3\d{9}$/.test(phone.replace(/[\s()-]/g, ""))) {
      setError("Enter a valid Pakistan mobile number (e.g. 03XXXXXXXXX)");
      return;
    }
    if (!form.streetAddress.trim() || !form.city.trim()) {
      setError("Full delivery address and city are required");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (form.saveAddress) {
        await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            phone,
            province: form.province,
            city: form.city.trim(),
            area: form.area.trim() || null,
            streetAddress: form.streetAddress.trim(),
            isDefaultShipping: true,
          }),
        }).catch(() => undefined);
      }

      // Keep profile phone in sync for future checkouts
      await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone,
        }),
      }).catch(() => undefined);

      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone,
          province: form.province,
          city: form.city.trim(),
          streetAddress: form.streetAddress.trim(),
          area: form.area.trim() || undefined,
          paymentMethod: "COD",
          customerNotes: form.customerNotes.trim() || undefined,
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        order?: { order_number?: string };
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Could not place order");
      }
      cart.clear();
      router.push(
        `/account/store-orders?placed=${encodeURIComponent(payload.order?.order_number || "")}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (!cart.ready) return <p className="text-sm text-muted">Loading checkout…</p>;

  if (!cart.items.length) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <h2 className="mt-0 text-navy">Nothing to checkout</h2>
        <Link href="/store" className="mt-4 inline-flex font-extrabold text-orange">
          Back to store →
        </Link>
      </div>
    );
  }

  const total = cart.subtotal + SHIPPING_FEE_PKR;

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-[1fr_340px] gap-[22px] max-[760px]:grid-cols-1"
    >
      <section className="rounded-2xl border border-line bg-white p-7">
        <h2 className="mt-0 text-navy">Cash on delivery details</h2>
        {!signedIn ? (
          <p className="mb-4 rounded-xl bg-[#fff5f0] px-3 py-2 text-sm text-[#b42318]">
            Please{" "}
            <Link className="font-bold underline" href="/login?next=/store/checkout">
              sign in
            </Link>{" "}
            to place your order.
          </p>
        ) : null}

        {addresses.length ? (
          <div className={`${fieldClassName} mb-3.5`}>
            <label>Use saved address</label>
            <select
              defaultValue={defaultAddress?.id || ""}
              onChange={(e) => applyAddress(e.target.value)}
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.fullName} — {address.city}
                  {address.area ? `, ${address.area}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
          <div className={fieldClassName}>
            <label>Full name *</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Receiver full name"
            />
          </div>
          <div className={fieldClassName}>
            <label>Contact number *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03XXXXXXXXX"
            />
          </div>
          <div className={fieldClassName}>
            <label>Province *</label>
            <select
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            >
              <option>Punjab</option>
              <option>Sindh</option>
              <option>Islamabad</option>
              <option>KPK</option>
              <option>Balochistan</option>
            </select>
          </div>
          <div className={fieldClassName}>
            <label>City *</label>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
            />
          </div>
          <div className={`${fieldClassName} col-span-full`}>
            <label>Area / locality</label>
            <input
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Gulshan, DHA, Model Town…"
            />
          </div>
          <div className={`${fieldClassName} col-span-full`}>
            <label>Complete street address *</label>
            <input
              required
              value={form.streetAddress}
              onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
              placeholder="House / flat, street, landmark"
            />
          </div>
          <div className={`${fieldClassName} col-span-full`}>
            <label>Order notes (optional)</label>
            <input
              value={form.customerNotes}
              onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
              placeholder="Gate code, preferred time…"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-[#526177]">
          <input
            type="checkbox"
            checked={form.saveAddress}
            onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })}
          />
          Save this address & contact for next orders
        </label>

        <div className="mt-4 rounded-xl border border-[#dceee9] bg-[#f3fbf8] px-3 py-3 text-sm text-[#0f6b5c]">
          Payment method: <strong>Cash on delivery only</strong>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl bg-[#ffe8e8] px-3 py-2 text-sm text-[#b42318]">{error}</p>
        ) : null}
      </section>

      <aside className="self-start rounded-2xl border border-line bg-white p-7">
        <h3 className="mt-0 text-navy">Your order</h3>
        <div className="mb-3 space-y-2 border-b border-line pb-3">
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-3 text-[13px] text-muted">
              <span>
                {item.title} × {item.quantity}
              </span>
              <strong>{formatStorePrice(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-[9px] text-[13px] text-muted">
          <span>Subtotal</span>
          <strong>{formatStorePrice(cart.subtotal)}</strong>
        </div>
        <div className="flex justify-between py-[9px] text-[13px] text-muted">
          <span>Delivery</span>
          <strong>{formatStorePrice(SHIPPING_FEE_PKR)}</strong>
        </div>
        <div className="mt-2.5 flex justify-between border-t border-line pt-3.5 text-lg font-black text-navy">
          <span>Total (COD)</span>
          <span>{formatStorePrice(total)}</span>
        </div>
        <button
          type="submit"
          disabled={busy || !signedIn}
          className="mt-[18px] inline-flex w-full items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white disabled:opacity-60"
        >
          {busy ? "Placing order…" : "Place COD order"}
        </button>
        <p className="flex items-center gap-1.5 text-[11px] leading-[1.5] text-muted">
          <LockKeyhole size={14} /> Pay cash when your order arrives.
        </p>
      </aside>
    </form>
  );
}
