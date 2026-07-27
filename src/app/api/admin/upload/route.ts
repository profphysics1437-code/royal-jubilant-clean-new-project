export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Storage Config ──────────────────────────────────────────────
// Alias route for /api/admin/upload — same implementation as /api/admin/media.
// Kept as a separate file because five frontend callers (MediaUploadField,
// PhotoUploader, ProfilePage, videos page, testimonials page) all POST to
// /api/admin/upload. Rather than editing each caller, we accept both URLs.
//
// NEVER hardcode the service role key here — read it from env. Falling back
// to a hardcoded secret caused a previous commit to be blocked by GitHub
// Push Protection.

const SUPA_URL =
  process.env.SUPABASE_URL ||
  "https://vxmxxoymiwpoaekgmigb.supabase.co";

const SUPA_KEY = process.env.SUPABASE_API_KEY;

if (!SUPA_KEY) {
  console.error(
    "[supabase] SUPABASE_API_KEY env var is missing — uploads will fail. " +
      "Set it in .env (server-side only, never commit)."
  );
}

const BUCKET = "media";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!SUPA_KEY) {
    throw new Error(
      "SUPABASE_API_KEY env var is missing. Set it in .env (server-side only)."
    );
  }
  if (!_supabase) {
    _supabase = createClient(SUPA_URL, SUPA_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

// GET: List media files (admin only)
export async function GET(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  const files = await db.mediaFile.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ files });
}

// POST: Upload one or more files to Supabase Storage.
//
// Accepts two field shapes for backwards compatibility:
//   - formData.append("file", file)            → single-file
//   - formData.append("files", file)           → multi-file
//   - formData.append("files", file1, file2…)  → multi-file
//
// Always returns `{ files: [...] }` so legacy callers reading `data.files[0]`
// keep working, and single-file callers reading `data.file` also work.
export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  const supabase = getSupabase();

  const formData = await req.formData();
  const folder = (formData.get("folder") as string) || "general";

  // Collect all file entries — handles both "file" and "files" field names,
  // and supports multiple files under the same "files" key.
  const incoming: File[] = [];
  for (const [key, value] of formData.entries()) {
    if ((key === "file" || key === "files") && value instanceof File) {
      incoming.push(value);
    }
  }

  if (incoming.length === 0) {
    return NextResponse.json(
      { error: "No file provided. Use field name 'file' or 'files'." },
      { status: 400 }
    );
  }

  const uploaded: Array<{
    filename: string;
    url: string;
    type: string;
    folder: string;
    size: number;
  }> = [];
  const errors: Array<{ filename: string; error: string }> = [];

  for (const file of incoming) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const uniqueName = `${randomUUID()}.${ext}`;
    const storagePath = `${folder}/${uniqueName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        errors.push({ filename: file.name, error: error.message });
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const url = publicUrlData.publicUrl;

      // Persist MediaFile record in Postgres
      const mediaFile = await db.mediaFile.create({
        data: {
          filename: file.name,
          url,
          type: file.type.startsWith("video")
            ? "video"
            : file.type.startsWith("image")
            ? "image"
            : "file",
          folder,
          size: file.size,
        },
      });

      uploaded.push({
        filename: mediaFile.filename,
        url: mediaFile.url,
        type: mediaFile.type,
        folder: mediaFile.folder,
        size: mediaFile.size,
      });
    } catch (e: any) {
      errors.push({ filename: file.name, error: e?.message || "Upload failed" });
    }
  }

  // Build response that satisfies every caller:
  //   - New code: data.files (array)
  //   - Legacy single-file code: data.file (first uploaded)
  const response: any = {
    files: uploaded,
    errors,
  };
  if (uploaded.length > 0) {
    response.file = uploaded[0];
  }

  // If everything failed, return 500
  if (uploaded.length === 0 && errors.length > 0) {
    return NextResponse.json(
      {
        error: `All uploads failed: ${errors
          .map((e) => `${e.filename} (${e.error})`)
          .join("; ")}`,
        errors,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(response);
}
