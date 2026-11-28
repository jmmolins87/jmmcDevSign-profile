import { Suspense } from "react";

import { LandingBlogArchiveFallback, LandingPage } from "@/app/[locale]/_components/landing-page";
import { LandingBlogArchive } from "@/app/[locale]/_components/landing-blog-section";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: HomePageProps) {
  return (
    <LandingPage
      blog={
        <Suspense fallback={<LandingBlogArchiveFallback />}>
          <LandingBlogArchive params={params} />
        </Suspense>
      }
    />
  );
}
