const ENDPOINT = "https://api.mangaupdates.com/v1";

export interface MURating {
  bayesian_rating: number | null;
  rating_votes: number;
}

export interface MUSeriesRecord {
  series_id: number;
  title: string;
  url: string;
  bayesian_rating: number | null;
  rating_votes: number;
  type: string;
  year: string | null;
  description: string | null;
  associated: Array<{ title: string }>;
}

async function muFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${ENDPOINT}${path}`, {
      ...init,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function searchByTitle(
  title: string
): Promise<MUSeriesRecord | null> {
  const body = JSON.stringify({
    search: title,
    type: "manhwa",
    perpage: 1,
    page: 1,
  });
  const data = await muFetch<{
    total_hits: number;
    results: Array<{ record: MUSeriesRecord }>;
  }>("/series/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return data?.results?.[0]?.record ?? null;
}

export async function getByID(id: number): Promise<MUSeriesRecord | null> {
  return muFetch<MUSeriesRecord>(`/series/${id}`);
}
