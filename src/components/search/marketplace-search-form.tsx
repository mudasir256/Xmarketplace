"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function MarketplaceSearchForm({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 shadow-[0_8px_24px_#04182f0a] focus-within:border-navy/25 focus-within:shadow-[0_0_0_3px_#00304914]"
      role="search"
    >
      <Search size={18} className="shrink-0 text-[#9aa6b5]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        name="q"
        type="search"
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-label="Search marketplace listings"
        placeholder="Search products, brands, cities..."
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-navy outline-none placeholder:text-[#9aa6b5]"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#8a97a8] hover:bg-[#eef2f6] hover:text-navy"
          onClick={() => {
            setQuery("");
            router.push("/search");
          }}
        >
          <X size={16} />
        </button>
      ) : null}
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-navy px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#04263d]"
      >
        Search
      </button>
    </form>
  );
}
