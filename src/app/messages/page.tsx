import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ChatWorkspace, type ChatProductContext } from "@/components/chat/chat-workspace";
import { getAuthUser } from "@/lib/auth";
import { getMarketplaceListingBySlug } from "@/lib/listings";
import { ChatProvider } from "@/providers/chat-provider";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    listing?: string;
    title?: string;
    image?: string;
    seller?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await getAuthUser();
  let initialProduct: ChatProductContext | null = null;

  if (params.listing) {
    const listing = await getMarketplaceListingBySlug(params.listing);
    if (listing) {
      initialProduct = {
        productId: listing.listingId || listing.id,
        listingSlug: listing.id,
        productTitle: listing.title,
        productImage: listing.images[0] || listing.image,
        sellerName: listing.seller.name,
      };
    } else {
      initialProduct = {
        productId: params.listing,
        listingSlug: params.listing,
        productTitle: params.title || "Marketplace listing",
        productImage: params.image || "/placeholder-listing.svg",
        sellerName: params.seller || "Seller",
      };
    }
  }

  return (
    <div
      data-chat-page
      className="max-[760px]:flex max-[760px]:h-dvh max-[760px]:max-h-dvh max-[760px]:flex-col max-[760px]:overflow-hidden"
    >
      <SiteHeader />
      <main className="bg-surface px-3 py-3 max-[760px]:flex max-[760px]:min-h-0 max-[760px]:flex-1 max-[760px]:flex-col max-[760px]:overflow-hidden max-[760px]:px-2 max-[760px]:py-2 max-[760px]:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col max-[760px]:min-h-0 max-[760px]:flex-1">
          <div className="mb-2 shrink-0 max-[760px]:hidden">
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.6px] text-navy">
              Messages
            </h1>
            <p className="mt-1 mb-0 text-sm text-muted">
              Live chat with buyers and sellers about marketplace ads.
            </p>
          </div>
          <div className="min-h-[560px] max-[760px]:min-h-0 max-[760px]:flex-1 max-[760px]:overflow-hidden md:h-[min(720px,calc(100vh-180px))] md:min-h-[520px]">
            <ChatProvider userId={user?.id ?? null}>
              <ChatWorkspace initialProduct={initialProduct} />
            </ChatProvider>
          </div>
        </div>
      </main>
      <div className="max-[760px]:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
