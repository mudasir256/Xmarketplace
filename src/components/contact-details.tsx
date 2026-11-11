import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteContact } from "@/lib/site-contact";

export function ContactDetails() {
  return (
    <div className="grid items-start gap-7 border-t border-line pt-7 sm:grid-cols-[180px_minmax(0,1fr)]">
      <Image
        src={siteContact.portrait}
        alt={siteContact.name}
        width={360}
        height={440}
        sizes="180px"
        className="aspect-[9/11] w-[180px] rounded-2xl object-cover object-top max-sm:mx-auto"
      />
      <div className="min-w-0">
        <h2 className="m-0 text-[24px] leading-tight text-navy max-sm:text-center">
          {siteContact.name}
        </h2>
        <p className="mb-5 mt-3 flex items-center gap-2 text-sm text-muted max-sm:justify-center">
          <MapPin size={16} aria-hidden="true" />
          {siteContact.location}
        </p>
        <div className="grid gap-3">
          <a
            href={`mailto:${siteContact.email}`}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-line p-4 text-navy transition-colors hover:border-brand-orange hover:bg-[#fff7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            <Mail size={19} className="shrink-0 text-brand-orange" aria-hidden="true" />
            <span className="min-w-0">
              <span className="mb-1 block text-xs text-muted">Email</span>
              <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{siteContact.email}</span>
            </span>
          </a>
          <a
            href={`tel:${siteContact.phone}`}
            className="flex items-center gap-3 rounded-xl border border-line p-4 text-navy transition-colors hover:border-brand-orange hover:bg-[#fff7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            <Phone size={19} className="shrink-0 text-brand-orange" aria-hidden="true" />
            <span>
              <span className="mb-1 block text-xs text-muted">Phone</span>
              <span className="block text-sm font-semibold">{siteContact.phoneDisplay}</span>
            </span>
          </a>
          <a
            href={siteContact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
