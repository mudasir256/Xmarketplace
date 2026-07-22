import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bell, Heart, MapPin, MessageCircle, Package, Settings, ShoppingBag, UserRound,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { accountHref, accountNavigation } from "@/lib/account-navigation";

const sections = {
  profile: {
    title: "My Profile",
    description: "View and manage your personal account information.",
    icon: UserRound,
    emptyTitle: "Your profile",
    emptyCopy: "Syed Mudasir Bukhari · smudasir256@gmail.com",
  },
  "marketplace-listings": {
    title: "My Ads",
    description: "Manage all the ads you have posted on the marketplace.",
    icon: Package,
    emptyTitle: "No active ads",
    emptyCopy: "Your active, pending, and expired ads will appear here.",
  },
  "buyer-requests": {
    title: "Buyer Requests",
    description: "Browse requests posted by buyers looking for products and services.",
    icon: ShoppingBag,
    emptyTitle: "No buyer requests available",
    emptyCopy: "New requests from buyers will appear here.",
  },
  "my-buyer-requests": {
    title: "My Buyer Requests",
    description: "Track and manage the buying requests you have created.",
    icon: ShoppingBag,
    emptyTitle: "You have not posted a request",
    emptyCopy: "Requests you create will appear on this page.",
  },
  favorites: {
    title: "Favorites",
    description: "Review the marketplace ads you have saved.",
    icon: Heart,
    emptyTitle: "No favorite ads yet",
    emptyCopy: "Tap the heart on an ad to save it here.",
  },
  "store-orders": {
    title: "Store Orders",
    description: "Track purchases made from the official store.",
    icon: Package,
    emptyTitle: "No store orders yet",
    emptyCopy: "Your order history and delivery status will appear here.",
  },
  addresses: {
    title: "Addresses",
    description: "Manage delivery and billing addresses for your account.",
    icon: MapPin,
    emptyTitle: "No saved addresses",
    emptyCopy: "Your saved delivery addresses will appear here.",
  },
  wishlist: {
    title: "Wishlist",
    description: "View products saved from the official store.",
    icon: Heart,
    emptyTitle: "Your wishlist is empty",
    emptyCopy: "Save official store products to find them here.",
  },
  messages: {
    title: "Messages",
    description: "Keep in touch with marketplace buyers and sellers.",
    icon: MessageCircle,
    emptyTitle: "No messages yet",
    emptyCopy: "Your conversations will appear here.",
  },
  notifications: {
    title: "Notifications",
    description: "See updates about your ads, requests, orders, and messages.",
    icon: Bell,
    emptyTitle: "You're all caught up",
    emptyCopy: "New account notifications will appear here.",
  },
  settings: {
    title: "Settings",
    description: "Manage your account preferences and privacy options.",
    icon: Settings,
    emptyTitle: "Account preferences",
    emptyCopy: "Email notifications enabled · Profile visibility public",
  },
} as const;

type SectionSlug = keyof typeof sections;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export default async function AccountSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = sections[section as SectionSlug];

  if (!content) notFound();

  const Icon = content.icon;

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
                key={item.slug}
              >
                {item.label}
              </Link>
            ))}
          </aside>
          <section className="rounded-2xl border border-line bg-white p-7">
            <span className="text-[13px] text-muted">My account</span>
            <h1 className="my-[5px] text-navy">{content.title}</h1>
            <p className="mt-1.5 text-muted">{content.description}</p>
            <div className="grid min-h-[250px] place-items-center text-center text-muted">
              <div>
                <Icon className="mx-auto mb-3.5 text-orange" size={42} />
                <strong className="block text-navy">{content.emptyTitle}</strong>
                <p>{content.emptyCopy}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
