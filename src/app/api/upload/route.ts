import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // D1's per-row/BLOB limit is 2MB - stay comfortably under it
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Used by the article editor's image button - stores inline images in D1 and returns a URL to insert into the content.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "לא מחוברים" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "לא נשלח קובץ" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "הקובץ גדול מדי (מקסימום 1.5MB)" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "סוג קובץ לא נתמך" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO media_files (id, content_type, data) VALUES (?1, ?2, ?3)`)
    .bind(id, file.type, await file.arrayBuffer())
    .run();

  return NextResponse.json({ url: `/media/${id}` });
}
