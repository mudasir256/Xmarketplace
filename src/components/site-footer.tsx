import Image from "next/image";
import Link from "next/link";
import logo from "../../xmarketplacelogo.png";

export function SiteFooter() {
  return (
    <footer className="bg-white px-10 py-[46px] text-[#c7d8df] max-[760px]:px-[14px] max-[760px]:pb-7 max-[760px]:pt-5">
      <div className="mx-auto w-full max-w-[1380px] rounded-3xl bg-brand-navy px-[52px] pb-[26px] pt-[42px] shadow-[0_18px_45px_#0030491f] max-[1050px]:px-[34px] max-[760px]:rounded-[28px] max-[760px]:px-5 max-[760px]:pb-6 max-[760px]:pt-9">
        <div className="grid grid-cols-[1.55fr_repeat(4,1fr)] pb-10 max-[1050px]:grid-cols-[1.4fr_repeat(2,1fr)] max-[1050px]:gap-y-9 max-[760px]:block max-[760px]:pb-[26px] [&>*]:min-w-0 [&>*]:border-l [&>*]:border-[#ffffff1f] [&>*]:px-7 [&>*:first-child]:border-l-0 [&>*:first-child]:pl-0 [&>*:last-child]:pr-0 max-[1050px]:[&>*:nth-child(4)]:border-l-0 max-[1050px]:[&>*:nth-child(4)]:pl-0 max-[760px]:[&>*]:border-l-0 max-[760px]:[&>*]:px-0">
          <div className="max-[760px]:pb-[30px] max-[760px]:text-center">
            <Image className="w-[190px] rounded-lg bg-white px-[10px] py-2 max-[760px]:mx-auto max-[760px]:w-[205px]" src={logo} alt="X Marketplace" />
            <p className="my-[17px] mb-[19px] max-w-[290px] text-xs leading-[1.7] text-[#b9cbd3] max-[760px]:mx-auto max-[760px]:text-[13px]">A modern Pakistani marketplace connecting trusted buyers and sellers, plus quality products from our official store.</p>
            <div className="flex gap-[9px] max-[760px]:mt-5 max-[760px]:justify-center">
              <a className="grid size-[34px] place-items-center rounded-full bg-brand-orange text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff713b] max-[760px]:size-11 max-[760px]:text-base max-[760px]:font-black" href="#" aria-label="LinkedIn">in</a>
              <a className="grid size-[34px] place-items-center rounded-full bg-brand-orange text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff713b] max-[760px]:size-11 max-[760px]:text-base max-[760px]:font-black" href="#" aria-label="Instagram">◎</a>
              <a className="grid size-[34px] place-items-center rounded-full bg-brand-orange text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff713b] max-[760px]:size-11 max-[760px]:text-base max-[760px]:font-black" href="#" aria-label="Facebook">f</a>
            </div>
            <p className="mt-4 max-w-[290px] text-xs leading-[1.7] text-[#b9cbd3] max-[760px]:mx-auto max-[760px]:mt-6 max-[760px]:max-w-[310px] max-[760px]:text-sm">Pakistan — serving buyers and sellers nationwide</p>
          </div>
          <details className="footer-section group max-[760px]:border-t max-[760px]:border-[#ffffff30]" open>
            <summary className="my-[2px] mb-[17px] cursor-default list-none text-[13px] font-bold text-[#ff6426] after:text-[13px] after:text-[#d7e1e5] after:transition-transform after:duration-200 group-open:after:rotate-180 max-[760px]:my-0 max-[760px]:flex max-[760px]:min-h-[74px] max-[760px]:cursor-pointer max-[760px]:items-center max-[760px]:justify-between max-[760px]:text-[17px] max-[760px]:text-white">Marketplace</summary>
            <div className="grid gap-[11px] text-xs max-[760px]:gap-[15px] max-[760px]:pb-6 max-[760px]:text-sm [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-white">
              <Link href="/category/featured">Featured Ads</Link>
              <Link href="/category/all">All Categories</Link>
              <Link href="/account/buyer-requests">Buyer Requests</Link>
              <Link href="/post-ad">Post an Ad</Link>
            </div>
          </details>
          <details className="footer-section group max-[760px]:border-t max-[760px]:border-[#ffffff30]" open>
            <summary className="my-[2px] mb-[17px] cursor-default list-none text-[13px] font-bold text-[#ff6426] after:text-[13px] after:text-[#d7e1e5] after:transition-transform after:duration-200 group-open:after:rotate-180 max-[760px]:my-0 max-[760px]:flex max-[760px]:min-h-[74px] max-[760px]:cursor-pointer max-[760px]:items-center max-[760px]:justify-between max-[760px]:text-[17px] max-[760px]:text-white">Official Store</summary>
            <div className="grid gap-[11px] text-xs max-[760px]:gap-[15px] max-[760px]:pb-6 max-[760px]:text-sm [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-white">
              <Link href="/store/category/new-arrivals">New Arrivals</Link>
              <Link href="/store/category/mobile-phones">Imported Mobiles</Link>
              <Link href="/store/category/clothing">Clothing</Link>
              <Link href="/store/category/sale">Sale</Link>
            </div>
          </details>
          <details className="footer-section group max-[760px]:border-y max-[760px]:border-[#ffffff30]" open>
            <summary className="my-[2px] mb-[17px] cursor-default list-none text-[13px] font-bold text-[#ff6426] after:text-[13px] after:text-[#d7e1e5] after:transition-transform after:duration-200 group-open:after:rotate-180 max-[760px]:my-0 max-[760px]:flex max-[760px]:min-h-[74px] max-[760px]:cursor-pointer max-[760px]:items-center max-[760px]:justify-between max-[760px]:text-[17px] max-[760px]:text-white">Support</summary>
            <div className="grid gap-[11px] text-xs max-[760px]:gap-[15px] max-[760px]:pb-6 max-[760px]:text-sm [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-white">
              <Link href="/safety">Safety Tips</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/account/store-orders">Track Order</Link>
            </div>
          </details>
          <div className="flex flex-col items-start gap-[10px] text-xs max-[760px]:items-center max-[760px]:px-0 max-[760px]:pb-2 max-[760px]:pt-[34px] max-[760px]:text-center max-[760px]:text-[15px]">
            <h4 className="mb-[7px] mt-0 text-[13px] text-[#ff6426] max-[760px]:text-xl max-[760px]:text-white">Contact Us</h4>
            <a className="transition-colors hover:text-white" href="mailto:hello@xmarketplace.pk">hello@xmarketplace.pk</a>
            <a className="transition-colors hover:text-white" href="tel:+923001234567">+92 300 1234567</a>
            <Link className="mt-[9px] rounded-full bg-brand-orange px-4 py-[11px] font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-dark max-[760px]:mt-3 max-[760px]:px-6 max-[760px]:py-[14px] max-[760px]:text-base" href="/contact">Get in touch</Link>
          </div>
        </div>
        <div className="grid min-h-[62px] grid-cols-3 items-end border-t border-[#ffffff28] pt-[22px] text-[10px] text-[#89a3af] max-[760px]:grid-cols-1 max-[760px]:items-center max-[760px]:gap-3 max-[760px]:text-center">
          <div className="flex gap-5 max-[760px]:justify-center [&_a:hover]:text-white">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </div>
          <span className="text-center">© 2026 X Marketplace. All rights reserved.</span>
          <span className="text-right text-[#ff7a46] max-[760px]:text-center">X Marketplace Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
