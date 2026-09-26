import type { Metadata } from "next";
import ZonaMiembrosClient from "./ZonaMiembrosClient";

export const metadata: Metadata = {
  title: "Zona de miembros · JMMC",
  description: "Acceso editorial para autores y colaboradores",
  openGraph: {
    title: "Zona de miembros · JMMC",
    description: "Acceso editorial para autores y colaboradores",
    type: "website",
  },
};

export default function ZonaMiembrosPage() {
  return <ZonaMiembrosClient />;
}