import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { Button } from "@/components/button";
import { Save } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/dev-login");

  const { env } = await getCloudflareContext({ async: true });
  const profile = await env.DB.prepare(
    `SELECT name, email, avatar_url FROM users WHERE id = ?1`
  )
    .bind(user.userId)
    .first<{ name: string; email: string; avatar_url: string | null }>();

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">הפרופיל שלי</h1>
      <p className="mt-1 text-sm text-black/60">
        התמונה והשם כאן מוצגים לצד המאמרים שלכם, גם באתר וגם בגרסת ההדפסה.
      </p>

      <form action={updateProfile} className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black/40">
              {profile?.name?.[0] ?? "?"}
            </div>
          )}
          <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" />
        </div>

        <div>
          <label className="text-sm text-black/60">שם מוצג</label>
          <input
            name="name"
            defaultValue={profile?.name}
            required
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-black/60">אימייל</label>
          <input
            value={profile?.email}
            disabled
            className="mt-1 w-full rounded border border-black/10 bg-black/[.03] px-3 py-2 text-black/50"
          />
        </div>

        <Button type="submit" variant="primary">
          <Save className="h-4 w-4" />
          שמירה
        </Button>
      </form>
    </div>
  );
}
