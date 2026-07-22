import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Bell, Heart, MapPin, MessageCircle, Package, Settings, ShoppingBag, UserRound,
} from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { MyListingsPanel } from "@/components/account/my-listings-panel";
import { ProfileForm } from "@/components/account/profile-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAddresses } from "@/lib/account/addresses";
import { listMyBuyerRequests, listOpenBuyerRequests } from "@/lib/account/buyer-requests";
import { getMyListings } from "@/lib/account/listings";
import {
  getSettings,
  listNotifications,
  listStoreOrders,
  listWishlist,
} from "@/lib/account/overview";
import { getProfile } from "@/lib/account/profile";
import { getAuthUser } from "@/lib/auth";
import { accountHref, accountNavigation } from "@/lib/account-navigation";
import { getFavoriteListings } from "@/lib/favorites";

export const dynamic = "force-dynamic";

const sections = {
  profile: {
    title: "My Profile",
    description: "View and manage your personal account information.",
    icon: UserRound,
  },
  "marketplace-listings": {
    title: "My Ads",
    description: "Manage all the ads you have posted on the marketplace.",
    icon: Package,
  },
  "buyer-requests": {
    title: "Buyer Requests",
    description: "Browse requests posted by buyers looking for products and services.",
    icon: ShoppingBag,
  },
  "my-buyer-requests": {
    title: "My Buyer Requests",
    description: "Track and manage the buying requests you have created.",
    icon: ShoppingBag,
  },
  favorites: {
    title: "Favorites",
    description: "Review the marketplace ads you have saved.",
    icon: Heart,
  },
  "store-orders": {
    title: "Store Orders",
    description: "Track purchases made from the official store.",
    icon: Package,
  },
  addresses: {
    title: "Addresses",
    description: "Manage delivery and billing addresses for your account.",
    icon: MapPin,
  },
  wishlist: {
    title: "Wishlist",
    description: "View products saved from the official store.",
    icon: Heart,
  },
  messages: {
    title: "Messages",
    description: "Keep in touch with marketplace buyers and sellers.",
    icon: MessageCircle,
  },
  notifications: {
    title: "Notifications",
    description: "See updates about your ads, requests, orders, and messages.",
    icon: Bell,
  },
  settings: {
    title: "Settings",
    description: "Manage your account preferences and privacy options.",
    icon: Settings,
  },
} as const;

type SectionSlug = keyof typeof sections;

function EmptyState({
  icon: Icon,
  title,
  copy,
  actionHref,
  actionLabel,
}: {
  icon: typeof Package;
  title: string;
  copy: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="grid min-h-[250px] place-items-center text-center text-muted">
      <div>
        <Icon className="mx-auto mb-3.5 text-orange" size={42} />
        <strong className="block text-navy">{title}</strong>
        <p>{copy}</p>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="mt-3 inline-flex font-extrabold text-orange">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default async function AccountSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "messages") redirect("/messages");
  const content = sections[section as SectionSlug];
  if (!content) notFound();

  const user = await getAuthUser();
  if (!user) redirect(`/login?next=/account/${section}`);

  const Icon = content.icon;

  const [
    profile,
    myListings,
    favoriteListings,
    openRequests,
    myRequests,
    orders,
    addresses,
    wishlist,
    notifications,
    settings,
  ] = await Promise.all([
    section === "profile" ? getProfile(user.id) : Promise.resolve(null),
    section === "marketplace-listings" ? getMyListings(user.id) : Promise.resolve([]),
    section === "favorites" ? getFavoriteListings() : Promise.resolve([]),
    section === "buyer-requests" ? listOpenBuyerRequests() : Promise.resolve([]),
    section === "my-buyer-requests" ? listMyBuyerRequests(user.id) : Promise.resolve([]),
    section === "store-orders" ? listStoreOrders(user.id) : Promise.resolve([]),
    section === "addresses" ? listAddresses(user.id) : Promise.resolve([]),
    section === "wishlist" ? listWishlist(user.id) : Promise.resolve([]),
    section === "notifications" ? listNotifications(user.id) : Promise.resolve([]),
    section === "settings" ? getSettings(user.id) : Promise.resolve(null),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] grid-cols-[240px_1fr] gap-[22px] max-[760px]:w-[calc(100%-24px)] max-[760px]:grid-cols-1">
          <aside className="self-start rounded-2xl border border-line bg-white p-3">
            {accountNavigation.map((item) => (
              <Link
                className={
                  item.slug === section
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
            <h1 className="my-[5px] text-navy">{content.title}</h1>
            <p className="mt-1.5 text-muted">{content.description}</p>

            {section === "profile" ? (
              <ProfileForm
                fullName={profile?.full_name || user.fullName}
                email={profile?.email || user.email}
                phone={profile?.phone || ""}
                avatarUrl={profile?.avatar_path || user.avatarUrl}
              />
            ) : null}

            {section === "marketplace-listings" ? (
              <MyListingsPanel initialListings={myListings} />
            ) : null}

            {section === "favorites" ? (
              favoriteListings.length > 0 ? (
                <div className="mt-6 grid grid-cols-3 gap-4 max-[1050px]:grid-cols-2 max-[760px]:grid-cols-1">
                  {favoriteListings.map((item) => (
                    <CatalogCard item={item} key={item.id} favorited />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icon}
                  title="No favorite ads yet"
                  copy="Tap the heart on an ad to save it here."
                  actionHref="/"
                  actionLabel="Browse ads →"
                />
              )
            ) : null}

            {section === "buyer-requests" ? (
              openRequests.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {openRequests.map((item) => (
                    <article key={item.id} className="rounded-xl border border-line p-4">
                      <h3 className="m-0 text-sm font-extrabold text-navy">{item.title}</h3>
                      <p className="mt-1 mb-0 text-sm text-muted">{item.description}</p>
                      <p className="mt-2 mb-0 text-xs text-muted">
                        {[item.city, item.categorySlug].filter(Boolean).join(" · ") || "Open request"}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icon}
                  title="No buyer requests available"
                  copy="New requests from buyers will appear here."
                />
              )
            ) : null}

            {section === "my-buyer-requests" ? (
              myRequests.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {myRequests.map((item) => (
                    <article key={item.id} className="rounded-xl border border-line p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="m-0 text-sm font-extrabold text-navy">{item.title}</h3>
                        <span className="text-[11px] font-extrabold tracking-wide text-muted uppercase">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 mb-0 text-sm text-muted">{item.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icon}
                  title="You have not posted a request"
                  copy="Use POST /api/account/buyer-requests to create one, or ask to add a create form next."
                />
              )
            ) : null}

            {section === "store-orders" ? (
              orders.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {orders.map((order) => (
                    <article key={order.id} className="rounded-xl border border-line p-4">
                      <h3 className="m-0 text-sm font-extrabold text-navy">{order.order_number}</h3>
                      <p className="mt-1 mb-0 text-sm text-muted">
                        {order.status} · {order.payment_status} · {order.currency}{" "}
                        {Number(order.grand_total).toLocaleString("en-PK")}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Icon} title="No store orders yet" copy="Your order history will appear here." />
              )
            ) : null}

            {section === "addresses" ? (
              addresses.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => (
                    <article key={address.id} className="rounded-xl border border-line p-4">
                      <h3 className="m-0 text-sm font-extrabold text-navy">{address.fullName}</h3>
                      <p className="mt-1 mb-0 text-sm text-muted">
                        {address.streetAddress}, {address.area ? `${address.area}, ` : ""}
                        {address.city}, {address.province}
                      </p>
                      <p className="mt-1 mb-0 text-xs text-muted">{address.phone}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Icon}
                  title="No saved addresses"
                  copy="Add one with POST /api/account/addresses."
                />
              )
            ) : null}

            {section === "wishlist" ? (
              wishlist.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {wishlist.map((item) => {
                    const product = Array.isArray(item.store_products)
                      ? item.store_products[0]
                      : item.store_products;
                    return (
                      <article key={item.id} className="rounded-xl border border-line p-4">
                        <h3 className="m-0 text-sm font-extrabold text-navy">
                          {product?.name || "Store product"}
                        </h3>
                        <p className="mt-1 mb-0 text-sm text-muted">
                          {product?.base_price != null
                            ? `PKR ${Number(product.base_price).toLocaleString("en-PK")}`
                            : "Saved item"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Icon} title="Your wishlist is empty" copy="Save official store products to find them here." />
              )
            ) : null}

            {section === "notifications" ? (
              notifications.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {notifications.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-xl border border-line p-4 ${item.is_read ? "bg-white" : "bg-[#fff8f4]"}`}
                    >
                      <h3 className="m-0 text-sm font-extrabold text-navy">{item.title}</h3>
                      <p className="mt-1 mb-0 text-sm text-muted">{item.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Icon} title="You're all caught up" copy="New account notifications will appear here." />
              )
            ) : null}

            {section === "settings" && settings ? (
              <div className="mt-6 space-y-2 text-sm text-muted">
                <p className="m-0">
                  Email notifications:{" "}
                  <strong className="text-navy">
                    {"email_notifications" in settings && settings.email_notifications ? "Enabled" : "Disabled"}
                  </strong>
                </p>
                <p className="m-0">
                  SMS notifications:{" "}
                  <strong className="text-navy">
                    {"sms_notifications" in settings && settings.sms_notifications ? "Enabled" : "Disabled"}
                  </strong>
                </p>
                <p className="m-0">
                  Profile visibility:{" "}
                  <strong className="text-navy">
                    {"profile_visibility" in settings ? String(settings.profile_visibility) : "public"}
                  </strong>
                </p>
                <p className="mt-3 mb-0 text-xs">Update via PATCH /api/account/settings</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
