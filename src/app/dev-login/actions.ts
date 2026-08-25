"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function signInAs(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const { env } = await getCloudflareContext({ async: true });
  const user = await env.DB.prepare(
    `SELECT id, email, name, avatar_url, role FROM users WHERE id = ?1`
  )
    .bind(userId)
    .first<{ id: number; email: string; name: string; avatar_url: string | null; role: "writer" | "admin" }>();

  if (!user) {
    throw new Error("User not found");
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    role: user.role,
  });
  await setSessionCookie(token);
  redirect("/");
}

export async function signOut() {
  await clearSessionCookie();
  redirect("/");
}
