import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

type BannerProps = {
  locale: string;
  dict: Dictionary;
};

export function Banner({ locale, dict }: BannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80"
          alt="Hero banner"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32 md:py-40">
        <h1 className="text-4xl font-black uppercase tracking-wider text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {dict.home.bannerHeading}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg md:text-xl">
          {dict.home.bannerSubtitle}
        </p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 inline-block rounded-full border-2 border-white bg-transparent px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
        >
          {dict.home.shopNow}
        </Link>
      </div>
    </section>
  );
}
