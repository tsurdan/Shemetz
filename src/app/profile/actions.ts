"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // D1's per-row/BLOB limit is 2MB - stay comfortably under it
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/dev-login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("שם לא יכול להיות ריק");

  const { env } = await getCloudflareContext({ async: true });
  let avatarUrl: string | undefined;

  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_AVATAR_BYTES) {
      throw new Error("התמונה גדולה מדי (מקסימום 1.5MB)");
    }
    if (!ALLOWED_TYPES.has(avatar.type)) {
      throw new Error("יש להעלות קובץ PNG, JPEG או WebP בלבד");
    }
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO media_files (id, content_type, data) VALUES (?1, ?2, ?3)`)
      .bind(id, avatar.type, await avatar.arrayBuffer())
      .run();
    avatarUrl = `/media/${id}`;
  }

  await env.DB.prepare(
    avatarUrl
      ? `UPDATE users SET name = ?1, avatar_url = ?2 WHERE id = ?3`
      : `UPDATE users SET name = ?1 WHERE id = ?2`
  )
    .bind(...(avatarUrl ? [name, avatarUrl, user.userId] : [name, user.userId]))
    .run();

  // Session cookie carries a name/avatar snapshot, so re-issue it to reflect the edit immediately.
  await setSessionCookie(
    await createSessionToken({ ...user, name, avatarUrl: avatarUrl ?? user.avatarUrl })
  );

  revalidatePath("/profile");
  revalidatePath("/write");
}
