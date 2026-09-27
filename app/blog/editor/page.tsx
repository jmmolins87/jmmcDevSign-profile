import type { Metadata } from "next";
import BlogEditorClient from "./BlogEditorClient";

export const metadata: Metadata = {
  title: "Editor del blog · JMMC",
  description: "Crea y edita artículos del blog",
  openGraph: {
    title: "Editor del blog · JMMC",
    description: "Crea y edita artículos del blog",
    type: "website",
  },
};

export default function BlogEditorPage() {
  return <BlogEditorClient />;
}
