"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ExternalLink, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import type { MyListing } from "@/lib/account/listings";

export function MyListingsPanel({ initialListings = [] }: { initialListings?: MyListing[] }) {
  const [listings, setListings] = useState<MyListing[]>(initialListings);
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadListings = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/account/listings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; listings?: MyListing[]; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.message || "Could not load your ads.");
        setListings([]);
        return;
      }

      setListings(payload.listings ?? []);
    } catch {
      setError("Could not load your ads.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  function onDelete(listing: MyListing) {
    const confirmed = window.confirm(`Delete “${listing.title}”? This cannot be undone.`);
    if (!confirmed) return;

    setPendingId(listing.id);
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/account/listings/${listing.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;

        if (!response.ok || !payload?.ok) {
          setMessage(payload?.message || "Could not delete this ad.");
          return;
        }

        setMessage("Ad deleted.");
        setListings((current) => current.filter((item) => item.id !== listing.id));
      } catch {
        setMessage("Could not delete this ad.");
      } finally {
        setPendingId(null);
      }
    });
  }

  if (loading) {
    return (
      <div className="mt-8 grid min-h-[220px] place-items-center text-muted">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <LoaderCircle className="animate-spin" size={18} /> Loading your ads…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 grid min-h-[220px] place-items-center text-center text-muted">
        <div>
          <strong className="block text-navy">Couldn’t load ads</strong>
          <p className="mt-1 mb-0">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadListings();
            }}
            className="mt-3 inline-flex font-extrabold text-orange"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="mt-8 grid min-h-[220px] place-items-center text-center text-muted">
        <div>
          <strong className="block text-navy">No active ads</strong>
          <p className="mt-1 mb-0">Your posted ads will appear here with edit and delete options.</p>
          <Link href="/post-ad" className="mt-3 inline-flex font-extrabold text-orange">
            Post an ad →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {message ? <p className="m-0 text-sm font-semibold text-navy">{message}</p> : null}
      {listings.map((listing) => (
        <article
          key={listing.id}
          className="flex items-center gap-4 rounded-xl border border-line bg-[#f8fafc] p-3 max-[760px]:flex-col max-[760px]:items-stretch"
        >
          <div className="relative size-[84px] shrink-0 overflow-hidden rounded-lg bg-white max-[760px]:h-40 max-[760px]:w-full">
            <Image src={listing.image} alt="" fill className="object-cover" sizes="84px" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="m-0 truncate text-[15px] font-extrabold text-navy">{listing.title}</h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#526177] uppercase">
                {listing.status}
              </span>
            </div>
            <p className="mt-1 mb-0 text-sm text-muted">
              {listing.categoryName} · {listing.city || "—"} ·{" "}
              {listing.price == null
                ? "Price on request"
                : `PKR ${new Intl.NumberFormat("en-PK").format(listing.price)}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/product/${listing.slug}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-extrabold text-navy"
            >
              <ExternalLink size={14} /> View
            </Link>
            <Link
              href={`/account/marketplace-listings/${listing.id}/edit`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-extrabold text-white"
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(listing)}
              disabled={pending && pendingId === listing.id}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#e11d48] px-3 text-xs font-extrabold text-white disabled:opacity-60"
            >
              <Trash2 size={14} /> {pending && pendingId === listing.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
