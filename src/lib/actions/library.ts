"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ReadingStatus, Manga, LibraryEntry } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────

interface DbLibraryRow {
  id: string;
  user_id: string;
  series_id: string;
  status: ReadingStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  series: {
    id: string;
    title: string;
    cover_image: string;
    synopsis: string;
    genres: string[];
    themes: string[];
    status: string;
    chapters: number;
    author: string;
    artist: string;
    year: number;
    rating: number;
    mu_rating: number | null;
  };
}

function dbRowToLibraryEntry(row: DbLibraryRow): LibraryEntry {
  const s = row.series;
  const manga: Manga = {
    id: s.id,
    title: s.title,
    coverImage: s.cover_image,
    synopsis: s.synopsis,
    genres: s.genres ?? [],
    themes: s.themes ?? [],
    rating: s.rating ?? 0,
    ratings: {
      anilist: s.rating ?? undefined,
      mangaupdates: s.mu_rating ?? undefined,
    },
    status: s.status as Manga["status"],
    chapters: s.chapters ?? 0,
    author: s.author ?? "Unknown",
    artist: s.artist ?? "Unknown",
    year: s.year ?? 0,
  };
  return {
    mangaId: row.series_id,
    manga,
    status: row.status,
    progress: row.progress,
    updatedAt: new Date(row.updated_at),
  };
}

// ── Queries ───────────────────────────────────────────────────

export async function getLibrary(): Promise<LibraryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("library")
    .select("*, series(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbLibraryRow[]).map(dbRowToLibraryEntry);
}

export async function getLibraryEntry(
  seriesId: string
): Promise<{ status: ReadingStatus; progress: number } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("library")
    .select("status, progress")
    .eq("user_id", user.id)
    .eq("series_id", seriesId)
    .maybeSingle();

  return data ?? null;
}

// ── Mutations ─────────────────────────────────────────────────

export async function addToLibrary(
  manga: Manga,
  status: ReadingStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Upsert series metadata so the library row can reference it
  const { error: seriesErr } = await supabase.from("series").upsert(
    {
      id: manga.id,
      anilist_id: parseInt(manga.id, 10),
      title: manga.title,
      cover_image: manga.coverImage,
      synopsis: manga.synopsis,
      genres: manga.genres,
      themes: manga.themes,
      status: manga.status,
      chapters: manga.chapters,
      author: manga.author,
      artist: manga.artist,
      year: manga.year,
      rating: manga.rating,
    },
    { onConflict: "id" }
  );
  if (seriesErr) return { error: seriesErr.message };

  const { error } = await supabase.from("library").upsert(
    {
      user_id: user.id,
      series_id: manga.id,
      status,
      progress: 0,
    },
    { onConflict: "user_id,series_id" }
  );
  if (error) return { error: error.message };

  revalidatePath("/library");
  return {};
}

export async function updateProgress(
  seriesId: string,
  progress: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("library")
    .update({ progress })
    .eq("user_id", user.id)
    .eq("series_id", seriesId);

  if (error) return { error: error.message };
  revalidatePath("/library");
  return {};
}

export async function updateStatus(
  seriesId: string,
  status: ReadingStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("library")
    .update({ status })
    .eq("user_id", user.id)
    .eq("series_id", seriesId);

  if (error) return { error: error.message };
  revalidatePath("/library");
  return {};
}

export async function removeFromLibrary(
  seriesId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("library")
    .delete()
    .eq("user_id", user.id)
    .eq("series_id", seriesId);

  if (error) return { error: error.message };
  revalidatePath("/library");
  return {};
}
