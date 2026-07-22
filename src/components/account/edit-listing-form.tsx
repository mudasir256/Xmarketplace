"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { LISTING_CONDITIONS, MARKETPLACE_CITIES } from "@/lib/marketplace";
import type { MyListing } from "@/lib/account/listings";

type CategoryOption = { id: string; name: string; slug: string };

const fieldClassName =
  "grid gap-[7px] [&>label]:text-xs [&>label]:font-extrabold [&>label]:text-[#526177] [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#dce3eb] [&>input]:bg-white [&>input]:p-3 [&>input]:outline-none [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#dce3eb] [&>select]:bg-white [&>select]:p-3 [&>select]:outline-none [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-[#dce3eb] [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:outline-none";

export function EditListingForm({
  listing,
  categories,
}: {
  listing: MyListing;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    setOk(false);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/account/listings/${listing.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: formData.get("categoryId"),
            city: formData.get("city"),
            title: formData.get("title"),
            price: formData.get("price"),
            condition: formData.get("condition"),
            contactNumber: formData.get("contactNumber"),
            description: formData.get("description"),
            status: formData.get("status") || "PUBLISHED",
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;

        if (!response.ok || !payload?.ok) {
          setOk(false);
          setMessage(payload?.message || "Could not update this ad.");
          return;
        }

        setOk(true);
        setMessage("Ad updated successfully.");
        router.push("/account/marketplace-listings");
        router.refresh();
      } catch {
        setOk(false);
        setMessage("Could not update this ad.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
      <div className={fieldClassName}>
        <label htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" required defaultValue={listing.categoryId}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={fieldClassName}>
        <label htmlFor="city">City</label>
        <select id="city" name="city" required defaultValue={listing.city ?? ""}>
          <option value="" disabled>
            Select a city
          </option>
          {MARKETPLACE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className={`${fieldClassName} col-span-2 max-[760px]:col-span-1`}>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required defaultValue={listing.title} />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="price">Price (PKR)</label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={listing.price ?? 0}
        />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="condition">Condition</label>
        <select id="condition" name="condition" required defaultValue={listing.condition ?? "USED"}>
          {LISTING_CONDITIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className={fieldClassName}>
        <label htmlFor="contactNumber">Contact number</label>
        <input
          id="contactNumber"
          name="contactNumber"
          required
          defaultValue={listing.contactNumber ?? ""}
        />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={listing.status === "SOLD" ? "SOLD" : listing.status === "ARCHIVED" ? "ARCHIVED" : "PUBLISHED"}
        >
          <option value="PUBLISHED">Published</option>
          <option value="SOLD">Sold</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className={`${fieldClassName} col-span-2 max-[760px]:col-span-1`}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          defaultValue={listing.description}
        />
      </div>

      {message ? (
        <p className={`col-span-2 m-0 text-sm font-semibold ${ok ? "text-[#12805a]" : "text-[#d14343]"}`}>
          {message}
        </p>
      ) : null}

      <div className="col-span-2 flex flex-wrap gap-2 max-[760px]:col-span-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange px-5 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : null}
          Save changes
        </button>
        <Link
          href="/account/marketplace-listings"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-5 text-sm font-extrabold text-navy"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
