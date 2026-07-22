import { ImagePlus } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PostAdPage() {
  const fieldClassName = "grid gap-[7px] [&>label]:text-xs [&>label]:font-extrabold [&>label]:text-[#526177] [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#dce3eb] [&>input]:bg-white [&>input]:p-3 [&>input]:outline-none [&>input:focus]:border-teal [&>input:focus]:shadow-[0_0_0_3px_#06a9b714] [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#dce3eb] [&>select]:bg-white [&>select]:p-3 [&>select]:outline-none [&>select:focus]:border-teal [&>select:focus]:shadow-[0_0_0_3px_#06a9b714] [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-[#dce3eb] [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:outline-none";

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-surface py-[42px]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[820px] max-[760px]:w-[calc(100%-24px)]">
          <div className="mb-[18px] flex gap-2 text-xs text-muted">Marketplace / Post an Ad</div>
          <section className="rounded-2xl border border-line bg-white p-7">
            <h1 className="mb-1.5 mt-0 text-navy">Post your ad</h1>
            <p className="text-sm text-muted">Add clear details to reach the right buyers. Your listing will be reviewed before publication.</p>
            <form className="mt-6 grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <div className={fieldClassName}><label>Category</label><select><option>Select a category</option><option>Vehicles</option><option>Property</option><option>Mobiles</option><option>Electronics</option></select></div>
              <div className={fieldClassName}><label>City</label><select><option>Select a city</option><option>Karachi</option><option>Lahore</option><option>Islamabad</option></select></div>
              <div className={`${fieldClassName} col-span-full`}><label>Ad title</label><input placeholder="What are you selling?" /></div>
              <div className={fieldClassName}><label>Price (PKR)</label><input type="number" placeholder="0" /></div>
              <div className={fieldClassName}><label>Condition</label><select><option>Used</option><option>New</option><option>Open box</option></select></div>
              <div className={`${fieldClassName} col-span-full`}><label>Description</label><textarea rows={6} placeholder="Describe the item, condition and important details" /></div>
              <div className={`${fieldClassName} col-span-full`}><label>Photos</label><button type="button" className="inline-flex min-h-[100px] items-center justify-center gap-2 rounded-[9px] border border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy"><ImagePlus /> Add up to 12 photos</button></div>
              <button className="col-span-full inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-orange-dark">Submit ad for review</button>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
