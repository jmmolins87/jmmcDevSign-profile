"use server";

import { createHash } from "node:crypto";

import { projectScopes } from "@/app/[locale]/_components/contact-scopes";
import { sendMail } from "@/app/lib/supabase/membership-mail";
import { requireMailTransport } from "@/app/lib/supabase/service-env";

type ContactResult = "idle" | "invalid" | "unavailable" | "sent";

const contactRecipient = "hola@jmmcdevsign.es";

export async function submitContact(_previous: ContactResult, form: FormData): Promise<ContactResult> {
  const name = form.get("name");
  const email = form.get("email");
  const message = form.get("message");
  const scope = projectScopes.find(({ value }) => value === form.get("scope"));
  if (typeof name !== "string" || !name.trim() || name.length > 120 ||
      typeof email !== "string" || email.length > 254 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) ||
      typeof message !== "string" || !message.trim() || message.length > 5000 ||
      !scope || form.get("website") !== "") return "invalid";

  const text = `Nombre: ${name.trim()}\nCorreo: ${email}\nProyecto: ${scope.label}\n\n${message.trim()}`;
  const key = createHash("sha256").update(text).digest("hex");
  try {
    const outcome = await sendMail(requireMailTransport(), {
      recipient: contactRecipient,
      replyTo: email,
      subject: "Nuevo mensaje del formulario de contacto",
      text,
    }, `portfolio-contact/${key}`);
    if (outcome.result === "sent") return "sent";
    console.warn("[contact] delivery unavailable", { reason: outcome.error });
  } catch {
    console.warn("[contact] mail configuration unavailable");
  }
  return "unavailable";
}
