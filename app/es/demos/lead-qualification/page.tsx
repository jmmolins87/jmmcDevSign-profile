import { QualificationPanel } from "@/app/es/demos/lead-qualification/qualification-panel";

export default function LeadQualificationPage() {
  return (
    <main aria-labelledby="qualification-page-title" className="min-h-[calc(100svh-4rem)] bg-background px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
      <QualificationPanel />
    </main>
  );
}
