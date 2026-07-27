import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreCheckoutClient } from "@/components/store/store-checkout-client";
import { listAddresses } from "@/lib/account/addresses";
import { getProfile } from "@/lib/account/profile";
import { getAuthUser } from "@/lib/auth";

export default async function CheckoutPage() {
  const user = await getAuthUser();
  const [profile, addresses] = user
    ? await Promise.all([getProfile(user.id), listAddresses(user.id)])
    : [null, []];

  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1180px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Cart / Checkout</div>
          <StoreCheckoutClient
            signedIn={Boolean(user)}
            initialProfile={
              profile
                ? {
                    fullName: profile.full_name || user?.fullName || "",
                    phone: profile.phone || "",
                  }
                : user
                  ? { fullName: user.fullName || "", phone: "" }
                  : null
            }
            initialAddresses={addresses}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
