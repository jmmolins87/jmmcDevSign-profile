import { SiteShell } from "@/app/es/_components/site-shell";

export default function SpanishLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
