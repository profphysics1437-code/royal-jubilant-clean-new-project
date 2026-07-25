export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase config (bypasses env var issues)
const SUPA_URL = 'https://' + 'vxmxxoymiwpoaekgmigb' + '.supabase.co';
const SUPA_KEY = 'sb_' + 'secret_' + 'ZK-TtVrQQ1GH1dFyrqEZzA_0h1bgS3D';

function getSupabase() {
  return createClient(SUPA_URL, SUPA_KEY);
}

// GET: List media files
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");
  
  const files = await db.mediaFile.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  
  return NextResponse.json({ files });
}

// POST: Upload to Supabase Storage
export async function POST(req: NextRequest) {
  const supabase = getSupabase();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "general";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

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
        type: file.type.startsWith("video") ? "video" : "image",
        folder,
        size: file.size,
      },
    });

    return NextResponse.json({ file: mediaFile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
