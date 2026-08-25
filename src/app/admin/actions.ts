"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("נדרשת הרשאת מנהל");
  }
  return user;
}

export async function approveArticle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE articles SET status = 'published', published_at = datetime('now'), rejection_note = NULL WHERE id = ?1`
  )
    .bind(id)
    .run();
  revalidatePath("/admin");
}

export async function rejectArticle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE articles SET status = 'draft', rejection_note = ?1 WHERE id = ?2`
  )
    .bind(note, id)
    .run();
  revalidatePath("/admin");
}

export async function unpublishArticle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE articles SET status = 'unpublished', unpublished_at = datetime('now') WHERE id = ?1`
  )
    .bind(id)
    .run();
  revalidatePath("/admin");
}

export async function addWriter(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = formData.get("role") === "admin" ? "admin" : "writer";
  if (!name || !email) throw new Error("שם ואימייל הם שדות חובה");

  const { env } = await getCloudflareContext({ async: true });
  // google_sub is NOT NULL/UNIQUE - a placeholder is used until the person's first real Google login overwrites it.
  await env.DB.prepare(
    `INSERT INTO users (google_sub, email, name, role) VALUES (?1, ?2, ?3, ?4)`
  )
    .bind(`pending:${email}`, email, name, role)
    .run();
  revalidatePath("/admin");
}
