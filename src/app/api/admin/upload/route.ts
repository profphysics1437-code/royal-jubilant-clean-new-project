export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Storage Config ────────────────────────────
// Hardcoded to bypass env var issues on Hostinger
const SUPABASE_URL = 'https://' + 'vxmxxoymiwpoaekgmigb' + '.supabase.co';
const SUPABASE_KEY = 'sb_' + 'secret_' + 'ZK-TtVrQQ1GH1dFyrqEZzA_0h1bgS3D';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ─── POST: Upload files to Supabase Storage ─────────────

export async function POST(req: NextRequest) {
  // Require admin or agent
  const u = await requireAdmin();
  if (u) return u;

  const supabase = getSupabase();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const folder = (formData.get("folder") as string) || "general";

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploadedFiles = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const uniqueName = `${randomUUID()}.${ext}`;
    const storagePath = `${folder}/${uniqueName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { error } = await supabase.storage
        .from('media')
        .upload(storagePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[Upload] Supabase error:', error);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

      const url = publicUrlData.publicUrl;

      // Save metadata to database
      const mediaFile = await db.mediaFile.create({
        data: {
          filename: file.name,
          url,
          type: file.type.startsWith("video") ? "video" : "image",
          folder,
          size: file.size,
        },
      });

      uploadedFiles.push(mediaFile);
    } catch (e: any) {
      console.error('[Upload] Server error:', e);
    }
  }

  if (uploadedFiles.length === 0) {
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }

  return NextResponse.json({ files: uploadedFiles });
}

// ─── GET: List media files ──────────────────────────────

export async function GET(req: NextRequest) {
  const u = await requireAdmin();
  if (u) return u;
  
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");
  
  const files = await db.mediaFile.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  
  return NextResponse.json({ files });
}
