import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves uploaded files back out of D1 (avatars, article images) - stored as BLOBs rather than in R2,
// since R2 requires a payment method on file even for free-tier usage and D1 does not.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const file = await env.DB.prepare(`SELECT content_type, data FROM media_files WHERE id = ?1`)
    .bind(key.join("/"))
    .first<{ content_type: string; data: ArrayBuffer }>();

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  // Re-wrapping the D1-sourced ArrayBuffer as a Uint8Array avoids a "failed to pipe response"
  // error the OpenNext/Workers response layer throws when handed the raw cross-binding ArrayBuffer directly.
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.content_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
