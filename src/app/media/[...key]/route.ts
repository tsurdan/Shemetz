import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

// Serves uploaded files back out of R2 (avatars today; article images/PDFs later) so we don't depend on R2's public-bucket feature.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const object = await env.MEDIA.get(key.join("/"));

  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
