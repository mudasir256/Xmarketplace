import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditListingForm } from "@/components/account/edit-listing-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMyListingById } from "@/lib/account/listings";
import { getAuthUser } from "@/lib/auth";
import { accountHref, accountNavigation } from "@/lib/account-navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/account/marketplace-listings");

  const { listingId } = await params;
  const listing = await getMyListingById(user.id, listingId);
  if (!listing) notFound();

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("marketplace_categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] grid-cols-[240px_1fr] gap-[22px] max-[760px]:w-[calc(100%-24px)] max-[760px]:grid-cols-1">
          <aside className="self-start rounded-2xl border border-line bg-white p-3">
            {accountNavigation.map((item) => (
              <Link
                className={
                  item.slug === "marketplace-listings"
                    ? "block rounded-lg bg-[#fff0eb] px-3.5 py-3 text-[13px] font-bold text-orange"
                    : "block rounded-lg px-3.5 py-3 text-[13px] font-bold text-[#536279] hover:bg-[#fff0eb] hover:text-orange"
                }
                href={accountHref(item.slug)}
                key={item.slug || "overview"}
              >
                {item.label}
              </Link>
            ))}
          </aside>
          <section className="rounded-2xl border border-line bg-white p-7">
            <span className="text-[13px] text-muted">My account / Marketplace Listings</span>
            <h1 className="my-[5px] text-navy">Edit ad</h1>
            <p className="mt-1.5 text-muted">Update details for “{listing.title}”.</p>
            <EditListingForm listing={listing} categories={categories ?? []} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
