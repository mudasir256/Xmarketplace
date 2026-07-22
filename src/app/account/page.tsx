import Link from "next/link";
import { Bell, Heart, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOverview } from "@/lib/account/overview";
import { getAuthUser } from "@/lib/auth";
import { accountHref, accountNavigation } from "@/lib/account-navigation";

export default async function AccountPage() {
  const user = await getAuthUser();
  const firstName = user?.fullName.split(" ")[0] || "there";
  const overview = user ? await getOverview(user.id) : null;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] grid-cols-[240px_1fr] gap-[22px] max-[760px]:w-[calc(100%-24px)] max-[760px]:grid-cols-1">
          <aside className="self-start rounded-2xl border border-line bg-white p-3">
            {accountNavigation.map((item) => (
              <Link
                className={
                  item.slug === ""
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
            <span className="text-[13px] text-muted">My account</span>
            <h1 className="my-[5px] text-navy">Welcome back, {firstName}</h1>
            <p className="mt-1.5 text-muted">
              Manage your marketplace activity and official store orders in one place.
            </p>
            <div className="mt-[22px] grid grid-cols-4 gap-3.5 max-[760px]:grid-cols-2">
              <div className="rounded-xl border border-line p-[18px]">
                <ShoppingBag className="text-orange" />
                <span className="text-xs text-muted">Active listings</span>
                <strong className="mt-2 block text-[25px] text-navy">
                  {overview?.activeListings ?? 0}
                </strong>
              </div>
              <div className="rounded-xl border border-line p-[18px]">
                <Package className="text-teal" />
                <span className="text-xs text-muted">Store orders</span>
                <strong className="mt-2 block text-[25px] text-navy">{overview?.storeOrders ?? 0}</strong>
              </div>
              <div className="rounded-xl border border-line p-[18px]">
                <Heart className="text-orange" />
                <span className="text-xs text-muted">Saved items</span>
                <strong className="mt-2 block text-[25px] text-navy">{overview?.savedItems ?? 0}</strong>
              </div>
              <div className="rounded-xl border border-line p-[18px]">
                <MessageCircle className="text-teal" />
                <span className="text-xs text-muted">Unread alerts</span>
                <strong className="mt-2 block text-[25px] text-navy">
                  {overview?.unreadNotifications ?? 0}
                </strong>
              </div>
            </div>
            <div className="mt-8 grid min-h-[180px] place-items-center text-center text-muted">
              <div>
                <Bell className="mx-auto mb-3" size={38} />
                <strong className="block text-navy">You&apos;re all caught up</strong>
                <p>Your latest account activity will appear here.</p>
                <Link href="/account/marketplace-listings" className="mt-3 inline-flex font-extrabold text-orange">
                  Manage my ads →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
