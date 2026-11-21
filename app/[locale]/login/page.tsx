import { LoginRoute } from "@/app/[locale]/login/login-route";
import { isLocale } from "@/app/lib/i18n";

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  return <LoginRoute locale={isLocale(locale) ? locale : "es"} searchParams={searchParams} />;
}
