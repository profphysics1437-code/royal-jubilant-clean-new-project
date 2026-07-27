export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/agent-guard";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Storage Config ──────────────────────────────────────────────
// Read from env — NEVER hardcode the service role key (GitHub Push Protection
// blocks commits containing Supabase secrets).
const SUPA_URL =
  process.env.SUPABASE_URL ||
  "https://vxmxxoymiwpoaekgmigb.supabase.co";

const SUPA_KEY = process.env.SUPABASE_API_KEY;

if (!SUPA_KEY) {
  console.error(
    "[supabase] SUPABASE_API_KEY env var is missing — agent uploads will fail. " +
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

// ─── Authorization model ──────────────────────────────────────────────────
// Agents are allowed to upload files to Supabase Storage (bucket 'media').
// They are NOT allowed to write to MediaFile table directly — the MediaFile
// row is created here in the API route, scoped to the agent's session.
//
// Property-ownership is enforced at the PATCH/POST /api/agent/listings route
// (it checks `existing.agentId !== session.user.id` before updating). The
// upload route itself does NOT need to validate property ownership because
// it only returns a URL — the URL isn't attached to any property until the
// agent saves the listing form (which IS ownership-guarded).
//
// Optional: this route accepts an `propertyId` form field for audit logging
// purposes. If provided, we verify the agent owns that property and log
// the upload. If not provided, we still allow the upload (the agent may be
// creating a new property and the ID doesn't exist yet).

export async function POST(req: NextRequest) {
  // ── Auth: must be a logged-in agent ──
  const session = await requireAgent();
  if (!("user" in session)) return session;
  const agentUserId = session.user.id;
  const agentEmail = (session.user as any).email;

  const supabase = getSupabase();

  const formData = await req.formData();
  const folder = (formData.get("folder") as string) || "agent-uploads";
  const propertyId = formData.get("propertyId") as string | null;

  // ── Optional ownership check (audit trail) ──
  // If the agent passed a propertyId, verify they own it before allowing
  // the upload. This prevents an agent from uploading images "for" another
  // agent's property even before the PATCH step.
  if (propertyId) {
    const existing = await db.property
      .findUnique({ where: { id: propertyId }, select: { agentId: true } })
      .catch(() => null);
    if (existing && existing.agentId !== agentUserId) {
      return NextResponse.json(
        {
          error:
            "You do not own this property. Uploads are only allowed for properties assigned to you.",
        },
        { status: 403 }
      );
    }
  }

  // ── Collect files (supports both 'file' and 'files' field names) ──
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

  // ── Per-agent folder namespace for tidiness in Supabase Storage ──
  // Format: {folder}/{agentUserId}/{uuid}.{ext}
  // This way one agent's uploads don't clutter another's folder.
  const namespacedFolder = `${folder}/${agentUserId.slice(-12)}`;

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
    const storagePath = `${namespacedFolder}/${uniqueName}`;

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

      // Persist MediaFile row — uploadedBy tracks the agent for audit
      const mediaFile = await db.mediaFile.create({
        data: {
          filename: file.name,
          url,
          type: file.type.startsWith("video")
            ? "video"
            : file.type.startsWith("image")
            ? "image"
            : "file",
          folder: namespacedFolder,
          size: file.size,
          uploadedBy: agentEmail || agentUserId,
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

  // Build response shape that satisfies every caller (same as admin route):
  //   - data.files (array)       — multi-file code
  //   - data.file  (first item)  — legacy single-file code
  const response: any = {
    files: uploaded,
    errors,
  };
  if (uploaded.length > 0) {
    response.file = uploaded[0];
  }

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

// GET is intentionally NOT implemented for agents — they don't need to
// browse the media library (only admins do). If needed in the future,
// add a GET that lists only files where `uploadedBy === agentEmail`.
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 405 });
}
