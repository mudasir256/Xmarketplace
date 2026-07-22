import { LockKeyhole } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CheckoutPage() {
  const fieldClassName = "grid gap-[7px] [&>label]:text-xs [&>label]:font-extrabold [&>label]:text-[#526177] [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#dce3eb] [&>input]:bg-white [&>input]:p-3 [&>input]:outline-none [&>input:focus]:border-teal [&>input:focus]:shadow-[0_0_0_3px_#06a9b714] [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#dce3eb] [&>select]:bg-white [&>select]:p-3 [&>select]:outline-none [&>select:focus]:border-teal [&>select:focus]:shadow-[0_0_0_3px_#06a9b714]";

  return (
    <>
      <SiteHeader mode="store" />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1180px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Cart / Checkout</div>
          <div className="grid grid-cols-[1fr_340px] gap-[22px] max-[760px]:grid-cols-1">
            <section className="rounded-2xl border border-line bg-white p-7">
              <h2 className="mt-0 text-navy">Delivery details</h2>
              <form className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
                <div className={fieldClassName}><label>Full name</label><input placeholder="Your full name" /></div>
                <div className={fieldClassName}><label>Phone number</label><input placeholder="+92 300 0000000" /></div>
                <div className={fieldClassName}><label>Province</label><select><option>Punjab</option><option>Sindh</option><option>Islamabad</option><option>KPK</option></select></div>
                <div className={fieldClassName}><label>City</label><input placeholder="City" /></div>
                <div className={`${fieldClassName} col-span-full`}><label>Street address</label><input placeholder="House, street, area" /></div>
                <div className={`${fieldClassName} col-span-full`}><label>Payment method</label><select><option>Cash on delivery</option><option>Bank transfer</option><option>Easypaisa</option><option>JazzCash</option></select></div>
              </form>
            </section>
            <aside className="self-start rounded-2xl border border-line bg-white p-7">
              <h3 className="mt-0 text-navy">Your order</h3>
              <div className="flex justify-between py-[9px] text-[13px] text-muted"><span>2 products</span><strong>PKR 289,498</strong></div>
              <div className="flex justify-between py-[9px] text-[13px] text-muted"><span>Delivery</span><strong>PKR 350</strong></div>
              <div className="mt-2.5 flex justify-between border-t border-line pt-3.5 text-lg font-black text-navy"><span>Total</span><span>PKR 289,848</span></div>
              <button className="mt-[18px] inline-flex w-full items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-orange-dark">Place order</button>
              <p className="flex items-center gap-1.5 text-[11px] leading-[1.5] text-muted"><LockKeyhole size={14} /> Your details are encrypted and protected.</p>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
