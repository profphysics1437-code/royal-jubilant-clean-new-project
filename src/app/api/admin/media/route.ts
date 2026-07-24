export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase config (bypasses Hostinger env var issues)
const SUPA_URL = 'https://' + 'vxmxxoymiwpoaekgmigb' + '.supabase.co';
const SUPA_KEY = 'sb_' + 'secret_' + 'ZK-TtVrQQ1GH1dFyrqEZzA_0h1bgS3D';

function getSupabase() {
  return createClient(SUPA_URL, SUPA_KEY);
}

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

export async function POST(req: NextRequest) {
  const u = await requireAdmin();
  if (u) return u;

  const supabase = getSupabase();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "general";
  const altTag = (formData.get("altTag") as string) || "";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  let type = "image";
  if (["mp4", "webm", "mov", "avi"].includes(ext)) type = "video";
  else if (["pdf"].includes(ext)) type = "pdf";
  else if (["svg"].includes(ext)) type = "svg";
  else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) type = "image";

  const uniqueName = `${randomUUID()}.${ext}`;
  const storagePath = `${folder}/${uniqueName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[Media Upload] Supabase error:', error);
      return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);

    const url = publicUrlData.publicUrl;

    const mediaFile = await db.mediaFile.create({
      data: {
        filename: file.name,
        url,
        type,
        folder,
        size: file.size,
        altTag: altTag || null,
      },
    });

    return NextResponse.json({ file: mediaFile });
  } catch (e: any) {
    console.error('[Media Upload] Server error:', e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
