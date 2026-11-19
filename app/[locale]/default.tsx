import { notFound } from "next/navigation";

/** Unmatched children in the modal slot must keep the public 404 behaviour. */
export default function UnmatchedPublicPage() { notFound(); }
