import { QualificationPanel } from "@/app/[locale]/demos/lead-qualification/qualification-panel";
import { DemoGuideProvider } from "@/app/components/demo-guide";

export default function LeadQualificationPage() {
  return (
    <DemoGuideProvider demo="qualification">
      <main aria-labelledby="qualification-page-title" className="min-h-[calc(100svh-4rem)] bg-background px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
        <QualificationPanel />
      </main>
    </DemoGuideProvider>
  );
}
