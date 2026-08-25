"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
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
      throw new Error("התמונה גדולה מדי (מקסימום 2MB)");
    }
    if (!ALLOWED_TYPES.has(avatar.type)) {
      throw new Error("יש להעלות קובץ PNG, JPEG או WebP בלבד");
    }
    const extension = avatar.type.split("/")[1];
    const key = `avatars/${user.userId}-${Date.now()}.${extension}`;
    await env.MEDIA.put(key, await avatar.arrayBuffer(), {
      httpMetadata: { contentType: avatar.type },
    });
    avatarUrl = `/media/${key}`;
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
