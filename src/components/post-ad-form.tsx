"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, ImagePlus, LoaderCircle, X } from "lucide-react";
import { submitMarketplaceAd, type PostAdState } from "@/app/post-ad/actions";
import {
  LISTING_CONDITIONS,
  MARKETPLACE_CITIES,
  MAX_LISTING_PHOTOS,
} from "@/lib/marketplace";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type PreviewPhoto = {
  id: string;
  file: File;
  url: string;
};

const initialState: PostAdState = { ok: false, message: "" };

const fieldClassName =
  "grid gap-[7px] [&>label]:text-xs [&>label]:font-extrabold [&>label]:text-[#526177] [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-[#dce3eb] [&>input]:bg-white [&>input]:p-3 [&>input]:outline-none [&>input:focus]:border-teal [&>input:focus]:shadow-[0_0_0_3px_#06a9b714] [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-[#dce3eb] [&>select]:bg-white [&>select]:p-3 [&>select]:outline-none [&>select:focus]:border-teal [&>select:focus]:shadow-[0_0_0_3px_#06a9b714] [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-[#dce3eb] [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:outline-none [&>textarea:focus]:border-teal [&>textarea:focus]:shadow-[0_0_0_3px_#06a9b714]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="m-0 text-xs font-semibold text-[#d14343]">{message}</p>;
}

export function PostAdForm({ categories }: { categories: CategoryOption[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PreviewPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [condition, setCondition] = useState<(typeof LISTING_CONDITIONS)[number]["value"]>("USED");
  const [state, formAction] = useActionState(submitMarketplaceAd, initialState);
  const [pending, startTransition] = useTransition();

  const photosError = photoError || state.fieldErrors?.photos;
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  useEffect(() => {
    if (!state.ok) return;
    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [state.ok, state.listingId]);

  const remainingSlots = useMemo(() => MAX_LISTING_PHOTOS - photos.length, [photos.length]);

  function addPhotos(fileList: FileList | null) {
    if (!fileList?.length) return;

    const incoming = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (incoming.length === 0) {
      setPhotoError("Only image files are allowed.");
      return;
    }

    if (incoming.length > remainingSlots) {
      setPhotoError(`You can add up to ${MAX_LISTING_PHOTOS} photos.`);
    } else {
      setPhotoError(null);
    }

    const next = incoming.slice(0, remainingSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos((current) => [...current, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((photo) => photo.id !== id);
    });
    setPhotoError(null);
  }

  function onSubmit(formData: FormData) {
    if (photos.length === 0) {
      setPhotoError("Add at least one photo");
      return;
    }

    photos.forEach((photo) => formData.append("photos", photo.file));
    startTransition(() => {
      formAction(formData);
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-[#f0d7b8] bg-[#fff8ef] px-4 py-3 text-sm text-[#8a5a16]">
        Marketplace categories are not set up yet. Run the latest Supabase migration, then refresh this page.
      </div>
    );
  }

  return (
    <form action={onSubmit} className="mt-6 grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
      <div className={fieldClassName}>
        <label htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" required defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.categoryId} />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="city">City</label>
        <select id="city" name="city" required defaultValue="">
          <option value="" disabled>
            Select a city
          </option>
          {MARKETPLACE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.city} />
      </div>

      <div className={`${fieldClassName} col-span-full`}>
        <label htmlFor="title">Ad title</label>
        <input id="title" name="title" required minLength={8} maxLength={120} placeholder="What are you selling?" />
        <FieldError message={state.fieldErrors?.title} />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="price">Price (PKR)</label>
        <input id="price" name="price" type="number" min={0} step={1} required placeholder="0" />
        <FieldError message={state.fieldErrors?.price} />
      </div>

      <div className={fieldClassName}>
        <label htmlFor="condition">Condition</label>
        <select
          id="condition"
          name="condition"
          required
          value={condition}
          onChange={(event) => setCondition(event.target.value as (typeof LISTING_CONDITIONS)[number]["value"])}
        >
          {LISTING_CONDITIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.condition} />
      </div>

      <div className={`${fieldClassName} col-span-full`}>
        <label htmlFor="contactNumber">Contact number</label>
        <input
          id="contactNumber"
          name="contactNumber"
          type="tel"
          inputMode="tel"
          required
          placeholder="03XXXXXXXXX"
          autoComplete="tel"
        />
        <p className="m-0 text-[11px] text-muted">Buyers will use this number to contact you about this ad.</p>
        <FieldError message={state.fieldErrors?.contactNumber} />
      </div>

      <div className={`${fieldClassName} col-span-full`}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          minLength={20}
          maxLength={5000}
          placeholder="Describe the item, condition and important details"
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <div className={`${fieldClassName} col-span-full`}>
        <label>Photos</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(event) => addPhotos(event.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={remainingSlots <= 0 || pending}
          className="inline-flex min-h-[100px] w-full items-center justify-center gap-2 rounded-[9px] border border-dashed border-navy bg-white px-[18px] py-[13px] font-extrabold text-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImagePlus /> Add up to {MAX_LISTING_PHOTOS} photos
          {photos.length > 0 ? ` (${photos.length}/${MAX_LISTING_PHOTOS})` : ""}
        </button>
        <FieldError message={photosError} />

        {photos.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-4 gap-2.5 p-0 max-[760px]:grid-cols-3">
            {photos.map((photo, index) => (
              <li key={photo.id} className="relative overflow-hidden rounded-lg border border-line bg-[#f4f7f9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Upload ${index + 1}`} className="h-[92px] w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>
                ) : null}
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {state.message ? (
        <div
          className={`col-span-full flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${
            state.ok ? "border border-[#b7e4c7] bg-[#edf9f1] text-[#1b6b3a]" : "border border-[#f0c2c2] bg-[#fff5f5] text-[#a32626]"
          }`}
          role="status"
        >
          {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : null}
          <span>{state.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="col-span-full inline-flex items-center justify-center gap-2 rounded-[9px] border-0 bg-orange px-5 py-3.5 font-extrabold text-white transition duration-200 hover:-translate-y-px hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit ad for review"
        )}
      </button>
    </form>
  );
}
