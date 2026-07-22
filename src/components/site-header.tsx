import Image from "next/image";
import Link from "next/link";
import {
  Bell, ChevronDown, Heart, LogOut, Menu, MessageCircle,
  Package, Plus, Search, Settings, ShoppingBag, ShoppingCart, UserRound, X,
} from "lucide-react";
import logo from "../../xmarketplacelogo.png";
import bikeImage from "@/images/Bike.png";
import propertySaleImage from "@/images/PropertyforSale.png";
import propertyRentImage from "@/images/PropertyforRent.png";
import vehicleImage from "@/images/car-new.png";
import mobilesImage from "@/images/mobiles.png";
import electronicsImage from "@/images/electronics.png";
import furnitureImage from "@/images/furniture.png";
import animalsImage from "@/images/animals.png";
import fashionImage from "@/images/Fashion.png";
import servicesImage from "@/images/services.png";
import { getAuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { LocationButton } from "@/components/location/location-button";
import { UserAvatar } from "@/components/user-avatar";

const mobileCategories = [
  { name: "Vehicles", slug: "vehicles", image: vehicleImage },
  { name: "Bikes", slug: "bikes", image: bikeImage },
  { name: "Property Sale", slug: "property-sale", image: propertySaleImage },
  { name: "Property Rent", slug: "property-rent", image: propertyRentImage },
  { name: "Mobiles", slug: "mobiles", image: mobilesImage },
  { name: "Electronics", slug: "electronics", image: electronicsImage },
  { name: "Furniture", slug: "furniture", image: furnitureImage },
  { name: "Animals", slug: "animals", image: animalsImage },
  { name: "Fashion", slug: "fashion", image: fashionImage },
  { name: "Services", slug: "services", image: servicesImage },
];

type SiteHeaderProps = {
  mode?: "marketplace" | "store";
};

export async function SiteHeader({ mode = "marketplace" }: SiteHeaderProps) {
  const store = mode === "store";
  const user = await getAuthUser();
  const displayName = user?.fullName ?? "Guest";
  const displayEmail = user?.email ?? "Sign in to continue";
  const avatarSrc = user?.avatarUrl;

  return (
    <>
      <header className="header-shell pointer-events-none fixed inset-x-0 top-0 z-[100] px-10 pt-[15px] max-[760px]:px-[14px] max-[760px]:pt-[14px]">
        <div className="floating-nav pointer-events-auto mx-auto flex min-h-[72px] w-[min(1380px,100%)] items-center gap-[11px] rounded-2xl border border-[#ffffffb8] bg-[rgba(246,249,252,.88)] px-[14px] py-[9px] shadow-[0_12px_35px_#04182f28] backdrop-blur-[18px] max-[1050px]:gap-[7px] max-[760px]:min-h-20 max-[760px]:flex-nowrap max-[760px]:justify-between max-[760px]:rounded-[22px] max-[760px]:bg-[rgba(234,240,244,.88)] max-[760px]:px-[14px] max-[760px]:py-[10px]">
          <Link className="shrink-0 max-[760px]:block max-[760px]:h-11 max-[760px]:w-12 max-[760px]:overflow-hidden" href={store ? "/store" : "/"} aria-label="X Marketplace home">
            <Image className="h-auto w-[148px] max-[1050px]:w-[130px] max-[760px]:h-11 max-[760px]:max-w-none max-[760px]:object-contain max-[760px]:object-left" src={logo} alt="X Marketplace" priority />
          </Link>
          <div className="flex shrink-0 rounded-[11px] bg-[#e8edf3] p-1 max-[760px]:hidden [&_a]:whitespace-nowrap [&_a]:rounded-lg [&_a]:px-[13px] [&_a]:py-[10px] [&_a]:text-xs [&_a]:font-extrabold [&_a]:text-[#59677d] max-[1050px]:[&_a]:px-[10px]" aria-label="Choose shopping experience">
            <Link className={!store ? "bg-brand-navy !text-white shadow-[0_4px_12px_#00304930]" : ""} href="/">Marketplace</Link>
            <Link className={store ? "bg-brand-navy !text-white shadow-[0_4px_12px_#00304930]" : ""} href="/store">Official Store</Link>
          </div>
          <details className="group relative shrink-0 max-[1050px]:hidden">
            <summary className="flex h-[43px] cursor-pointer list-none items-center justify-center gap-2 whitespace-nowrap rounded-[9px] border border-[#d5dde7] bg-white px-[13px] text-xs font-extrabold text-[#24344a] hover:border-[#8a9aa8] hover:shadow-[0_0_0_2px_#71869635] group-open:border-[#8a9aa8] group-open:shadow-[0_0_0_2px_#71869635] [&::-webkit-details-marker]:hidden">
              Categories <ChevronDown className="transition-transform duration-200 group-open:rotate-180" size={16} />
            </summary>
            <nav className="absolute left-0 top-[calc(100%+16px)] grid w-[360px] grid-cols-2 gap-x-3 gap-y-1 rounded-[18px] border border-[#e1e6ec] bg-white p-[18px] shadow-[0_20px_48px_#04182f38] [&_a]:flex [&_a]:min-h-[58px] [&_a]:items-center [&_a]:gap-3 [&_a]:rounded-[10px] [&_a]:px-[10px] [&_a]:py-2 [&_a]:text-sm [&_a]:font-bold [&_a]:text-[#2c394c] [&_a:hover]:bg-[#f4f7f9] [&_a:hover]:text-brand-orange" aria-label="Product categories">
              {mobileCategories.map((category) => (
                <Link
                  href={store ? `/store/category/${category.slug}` : `/category/${category.slug}`}
                  key={category.slug}
                >
                  <Image className="h-9 w-10 shrink-0 object-contain" src={category.image} alt="" />
                  <span>{category.name}</span>
                </Link>
              ))}
            </nav>
          </details>
          <form className="flex h-[43px] min-w-[125px] flex-[1_1_180px] items-center gap-2 overflow-hidden rounded-[9px] border border-[#d5dde7] bg-[#eef2f6] px-3 max-[760px]:hidden" action="/search">
            <Search className="shrink-0 text-[#9aa6b5]" size={17} />
            <input className="min-w-[70px] flex-1 border-0 bg-transparent p-0 text-xs text-brand-ink outline-0" name="q" aria-label="Search" placeholder={store ? "Search official products..." : "Search products..."} />
          </form>
          <LocationButton />
          <div className="flex items-center gap-2 max-[760px]:hidden">
            <Link className="relative grid h-10 w-[34px] place-items-center rounded-lg text-[#17283c] hover:bg-[#e7edf3]" href={store ? "/store/wishlist" : "/account/favorites"}>
              <Heart size={19} />
            </Link>
            <Link className="relative grid h-10 w-[34px] place-items-center rounded-lg text-[#17283c] hover:bg-[#e7edf3]" href={store ? "/store/cart" : "/account/marketplace-listings"}>
              {store ? <ShoppingCart size={19} /> : <ShoppingBag size={19} />}
              {store && <b className="absolute -top-1.5 right-0 grid size-[17px] place-items-center rounded-full bg-brand-orange text-[9px] font-extrabold text-white">2</b>}
            </Link>
            <Link className="relative grid h-10 w-[34px] place-items-center rounded-lg text-[#17283c] hover:bg-[#e7edf3] max-[1050px]:hidden" href="/messages"><MessageCircle size={19} /></Link>
            <Link className="relative grid h-10 w-[34px] place-items-center rounded-lg text-[#17283c] hover:bg-[#e7edf3] max-[1050px]:hidden" href="/account/notifications"><Bell size={19} /></Link>
            <Link className="whitespace-nowrap rounded-[9px] bg-brand-orange px-[17px] py-3 text-xs font-extrabold text-white shadow-[0_5px_14px_#ff4d1230] hover:-translate-y-px hover:bg-brand-orange-dark" href={store ? "/store" : "/post-ad"}>
              {store ? "Shop Now" : "+  Post Ad"}
            </Link>
            {user ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 whitespace-nowrap rounded-[10px] py-[3px] pl-0.5 pr-[5px] hover:bg-[#e7edf3] group-open:bg-[#e7edf3] [&::-webkit-details-marker]:hidden" aria-label="Open account menu">
                  <span className="size-[38px] overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--color-brand-orange),#ff9f1c)]">
                    <UserAvatar className="h-full w-full object-cover" src={avatarSrc} alt={displayName} size={38} />
                  </span>
                  <span className="max-[1050px]:hidden">
                    <strong className="block text-[10px] text-[#24344a]">My Account</strong>
                    <small className="mt-0.5 block max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap text-[8px] text-[#8a95a5]">{displayName}</small>
                  </span>
                  <ChevronDown className="text-[#6e7b8d] transition-transform duration-200 group-open:rotate-180 max-[1050px]:hidden" size={15} />
                </summary>
                <nav className="absolute right-0 top-[calc(100%+17px)] w-[340px] overflow-hidden rounded-[20px] border border-[#dbe3e9] bg-white shadow-[0_20px_48px_#04182f38]" aria-label="Account menu">
                  <div className="flex min-h-[105px] items-center gap-[15px] bg-[linear-gradient(135deg,#006184,#004763)] px-[22px] py-5 text-white">
                    <UserAvatar className="size-[62px] shrink-0 rounded-full object-cover" src={avatarSrc} alt={displayName} size={62} />
                    <span className="min-w-0">
                      <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-base tracking-[.2px]">{displayName}</strong>
                      <small className="mt-1.5 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#d3e4eb]">{displayEmail}</small>
                    </span>
                  </div>
                  <div className="py-[10px] [&_a]:flex [&_a]:min-h-[54px] [&_a]:items-center [&_a]:gap-4 [&_a]:px-[22px] [&_a]:py-2 [&_a]:text-[15px] [&_a]:font-bold [&_a]:text-[#2d3a4c] [&_a:hover]:bg-[#f7f9fb] [&_a:hover]:text-brand-orange [&_svg]:size-[23px] [&_svg]:text-[#758191]">
                    <Link href="/account/profile"><UserRound /><span>My Profile</span></Link>
                    <Link href="/account/marketplace-listings"><Package /><span>My Ads</span></Link>
                    <Link href="/account/favorites"><Heart /><span>Favorites</span></Link>
                    <Link href="/account/buyer-requests"><ShoppingBag /><span>Buyer requests</span></Link>
                    <Link href="/account/my-buyer-requests"><ShoppingBag /><span>My buyer requests</span></Link>
                  </div>
                  <LogoutButton className="flex min-h-[68px] w-full items-center gap-[15px] border-t border-[#e8ecf0] bg-transparent px-6 py-3 text-left text-[15px] font-black text-[#d60019] hover:bg-[#fff7f8] [&_svg]:size-[23px]">
                    <LogOut /><span>Logout</span>
                  </LogoutButton>
                </nav>
              </details>
            ) : (
              <Link className="whitespace-nowrap rounded-[9px] border border-[#d5dde7] bg-white px-[15px] py-3 text-xs font-extrabold text-[#24344a] hover:border-[#8a9aa8]" href="/login">
                Log in
              </Link>
            )}
          </div>
          <details className="mobile-menu group relative hidden max-[760px]:block">
            <summary className="grid size-[52px] cursor-pointer list-none place-items-center rounded-[17px] border-2 border-[#6f8492] bg-[#dce5ea] text-[#0d1b2f] shadow-[inset_0_0_0_2px_#ffffff78] group-open:bg-white [&::-webkit-details-marker]:hidden" aria-label="Open navigation menu">
              <Menu className="group-open:hidden" size={29} />
              <X className="hidden group-open:block" size={29} />
            </summary>
            <nav className="fixed inset-x-[14px] top-[94px] grid max-h-[calc(100dvh-96px)] gap-[9px] overflow-y-auto rounded-b-[22px] border border-t-0 border-[#ffffffb8] bg-[rgba(224,231,235,.96)] px-[14px] pb-[14px] pt-4 shadow-[0_18px_38px_#04182f3b] backdrop-blur-[20px]" aria-label="Mobile menu">
              {user ? (
                <div className="flex min-h-20 items-center gap-[13px] rounded-[18px] bg-[linear-gradient(135deg,#006184,#004763)] px-4 py-[10px] text-white shadow-[0_8px_18px_#00486324]">
                  <UserAvatar className="size-[54px] max-w-none shrink-0 rounded-full object-cover" src={avatarSrc} alt={displayName} size={54} />
                  <span>
                    <strong className="block text-[15px] tracking-[.1px]">{displayName}</strong>
                    <small className="mt-[3px] block text-[11px] text-[#d2e5ec]">{displayEmail}</small>
                  </span>
                </div>
              ) : (
                <Link className="flex min-h-20 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#006184,#004763)] px-4 text-[15px] font-black text-white shadow-[0_8px_18px_#00486324]" href="/login">
                  Log in / Sign up
                </Link>
              )}
              <Link className="flex min-h-[58px] items-center justify-center gap-2 rounded-[15px] bg-[#ff6314] p-2 text-[17px] font-black text-white shadow-[0_7px_15px_#e74c1338]" href={store ? "/store" : "/post-ad"}>
                <span className="text-[25px] font-light leading-none">＋</span>{store ? "Shop Now" : "Post Ad"}
              </Link>
              <div className="grid rounded-[18px] border border-[#e4e8eb] bg-[rgba(255,255,255,.96)] px-[10px] py-1.5 shadow-[0_5px_14px_#04182f12] [&_a]:flex [&_a]:min-h-12 [&_a]:items-center [&_a]:gap-[14px] [&_a]:rounded-[9px] [&_a]:px-[9px] [&_a]:py-1.5 [&_a]:text-sm [&_a]:font-bold [&_a]:text-[#273344] [&_a:hover]:bg-[#fff4ef] [&_a:hover]:text-brand-orange [&_svg]:size-[22px] [&_svg]:text-[#74808d]">
                <Link href="/account/profile"><UserRound /><span>My Profile</span></Link>
                <Link href="/account/marketplace-listings"><Package /><span>My Ads</span></Link>
                <Link href="/account/favorites"><Heart /><span>Favorites</span></Link>
                <Link href="/account/buyer-requests"><ShoppingBag /><span>Buyer requests</span></Link>
                <Link href="/account/my-buyer-requests"><ShoppingBag /><span>My buyer requests</span></Link>
                <Link href="/messages"><MessageCircle /><span>Messages</span></Link>
                <Link href="/account/settings"><Settings /><span>Settings</span></Link>
              </div>
              {user ? (
                <LogoutButton className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] border-0 bg-[#fff6f7] text-sm font-black text-[#d40018] [&_svg]:w-[21px]">
                  <LogOut /><span>Logout</span>
                </LogoutButton>
              ) : (
                <Link className="flex min-h-[52px] items-center justify-center gap-2 rounded-[15px] bg-[#fff6f7] text-sm font-black text-[#d40018]" href="/login">
                  Log in
                </Link>
              )}
              <details className="group/categories border-t border-[#ffffffb8] pt-[9px]">
                <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between rounded-[15px] border border-[#e1e6e9] bg-white px-[17px] text-sm font-black text-[#273344] [&::-webkit-details-marker]:hidden"><span>Categories</span><ChevronDown className="w-5 transition-transform duration-200 group-open/categories:rotate-180" /></summary>
                <div className="mt-[7px] grid max-h-60 overflow-y-auto rounded-[15px] bg-[rgba(255,255,255,.93)] p-[5px]">
                  {mobileCategories.map((category) => (
                    <Link className="flex min-h-[47px] items-center gap-[11px] rounded-lg px-[11px] py-1.5 text-[13px] font-extrabold text-brand-ink hover:bg-[#fff2ed] hover:text-brand-orange" href={`/category/${category.slug}`} key={category.slug}>
                      <Image className="size-7 object-contain" src={category.image} alt="" />
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </details>
              <div className="grid grid-cols-2 gap-[5px] rounded-[17px] bg-[#cbd6dc] p-[5px] shadow-[inset_0_1px_3px_#04182f13] [&_a]:grid [&_a]:min-h-[46px] [&_a]:place-items-center [&_a]:rounded-[13px] [&_a]:p-1.5 [&_a]:text-center [&_a]:text-xs [&_a]:font-black [&_a]:text-[#526173]" aria-label="Switch shopping experience">
                <Link className={!store ? "bg-brand-navy !text-white shadow-[0_5px_12px_#00304930]" : ""} href="/">Marketplace</Link>
                <Link className={store ? "bg-brand-navy !text-white shadow-[0_5px_12px_#00304930]" : ""} href="/store">Official Store</Link>
              </div>
            </nav>
          </details>
        </div>
      </header>
      <div className="h-24 max-[760px]:h-[102px]" />
      <nav className="mobile-bottom-nav fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-4 right-4 z-[110] hidden min-h-[76px] grid-cols-5 items-center rounded-[28px] border border-[#e3e8ed] px-3 py-2 shadow-[0_10px_30px_#04182f2b] backdrop-blur-[18px] max-[760px]:grid [&_a]:relative [&_a]:grid [&_a]:h-[58px] [&_a]:w-full [&_a]:place-items-center [&_a]:rounded-[18px] [&_a]:text-[#273344] [&_a:active]:bg-[#fff0ea] [&_a:active]:text-brand-orange [&_svg]:size-[27px]" aria-label="Mobile quick navigation">
        <Link href="/search" aria-label="Search"><Search /></Link>
        <Link href="/account/notifications" aria-label="Notifications"><Bell /></Link>
        <Link className="!size-[68px] -translate-y-[31px] place-self-start rounded-full border-[6px] border-[#edf1f4] bg-[linear-gradient(145deg,#ff743f,var(--color-brand-orange))] !text-white shadow-[0_8px_18px_#ff4d1248] active:-translate-y-[29px] active:scale-96 active:bg-[linear-gradient(145deg,var(--color-brand-orange),var(--color-brand-orange-dark))] [&_svg]:!size-[31px]" href="/post-ad" aria-label="Post an ad"><Plus /></Link>
        <Link href={store ? "/store/wishlist" : "/account/favorites"} aria-label="Favorites"><Heart /></Link>
        <Link href="/messages" aria-label="Messages"><MessageCircle /></Link>
      </nav>
    </>
  );
}
