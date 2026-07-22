import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const pages = {
  safety: {
    title: "Safety Tips",
    intro: "Simple steps to help you buy and sell safely on X Marketplace.",
    sections: [
      ["Meet in a safe place", "Choose a busy public location, bring someone with you, and avoid sharing your home address unnecessarily."],
      ["Check before paying", "Inspect the item carefully and confirm that it matches the listing before completing payment."],
      ["Keep conversations on-platform", "Use marketplace messages and never share passwords, verification codes, or sensitive banking information."],
      ["Report suspicious activity", "Contact our support team if a listing, message, or payment request does not feel right."],
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Quick answers about listings, orders, payments, and your account.",
    sections: [
      ["How do I post an ad?", "Create an account, select Post Ad, add the product details and photos, then submit your listing."],
      ["How do I contact a seller?", "Open a listing and use its message option to start a conversation with the seller."],
      ["How can I track an official store order?", "Open My Account, select Store Orders, and choose the order you want to track."],
      ["Can I save products for later?", "Use the heart icon to add marketplace ads to Favorites or store products to your Wishlist."],
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "Our support team is ready to help with marketplace and official store questions.",
    sections: [
      ["Email", "hello@xmarketplace.pk"],
      ["Phone", "+92 300 1234567"],
      ["Support hours", "Monday to Saturday, 9:00 AM–6:00 PM PKT"],
      ["Location", "Pakistan — serving buyers and sellers nationwide"],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "How X Marketplace handles and protects your information.",
    sections: [
      ["Information we collect", "We collect account details, listing information, order data, and messages needed to provide marketplace services."],
      ["How information is used", "Your information helps us operate accounts, process orders, improve safety, and provide customer support."],
      ["Sharing and security", "We do not sell personal information. Data is shared only with service providers when required to operate the platform."],
      ["Your choices", "You may update your profile and communication preferences from your account settings."],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "The rules for using X Marketplace and its official store.",
    sections: [
      ["Using the marketplace", "Users must provide accurate information and may only list products and services permitted by applicable law."],
      ["Listings and transactions", "Marketplace buyers and sellers are responsible for inspecting items and agreeing on transaction terms."],
      ["Official store orders", "Store purchases are subject to the prices, delivery estimates, and return conditions shown at checkout."],
      ["Account responsibility", "You are responsible for protecting your login details and activity performed through your account."],
    ],
  },
} as const;

type InfoSlug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((infoSlug) => ({ infoSlug }));
}

export default async function InfoPage({ params }: { params: Promise<{ infoSlug: string }> }) {
  const { infoSlug } = await params;
  const page = pages[infoSlug as InfoSlug];
  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[900px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">X Marketplace / {page.title}</div>
          <section className="rounded-2xl border border-line bg-white p-[clamp(28px,5vw,54px)]">
            <h1 className="m-0 text-[clamp(30px,5vw,44px)] text-navy">{page.title}</h1>
            <p className="my-3 mb-[34px] max-w-[680px] leading-[1.7] text-muted">{page.intro}</p>
            <div className="grid gap-0">
              {page.sections.map(([title, copy]) => (
                <article className="border-t border-line py-[22px]" key={title}>
                  <h2 className="mb-2 mt-0 text-[17px] text-navy">{title}</h2>
                  <p className="m-0 text-sm leading-[1.7] text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
