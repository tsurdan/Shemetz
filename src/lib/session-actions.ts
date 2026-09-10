"use server";

import { clearSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function signOut() {
  await clearSessionCookie();
  redirect("/");
}
