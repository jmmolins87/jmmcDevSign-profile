import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LandingPage } from "@/app/[locale]/_components/landing-page";
import { LandingBlogArchive, LandingBlogArchiveFallback } from "@/app/[locale]/_components/landing-blog-section";
import { isLocale } from "@/app/lib/i18n";

type SpanishHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SpanishHomePage({ params }: SpanishHomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <LandingPage
      blog={
        <Suspense fallback={<LandingBlogArchiveFallback locale={locale} />}>
          <LandingBlogArchive locale={locale} />
        </Suspense>
      }
    />
  );
}
