const ENDPOINT = "https://graphql.anilist.co";

export interface AniListManga {
  id: number;
  title: { romaji: string; english: string | null; native: string };
  description: string | null;
  coverImage: { large: string; extraLarge: string; color: string | null };
  bannerImage: string | null;
  genres: string[];
  tags: Array<{ name: string; category: string; rank: number }>;
  averageScore: number | null;
  popularity: number;
  status:
    | "RELEASING"
    | "FINISHED"
    | "HIATUS"
    | "CANCELLED"
    | "NOT_YET_RELEASED";
  chapters: number | null;
  startDate: { year: number | null };
  staff: {
    edges: Array<{
      role: string;
      node: { name: { full: string } };
    }>;
  };
}

// tags is a flat array — no sort/pagination args allowed
const MANGA_FRAGMENT = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge color }
  bannerImage
  genres
  tags { name category rank }
  averageScore
  popularity
  status
  chapters
  startDate { year }
  staff(perPage: 6) {
    edges {
      role
      node { name { full } }
    }
  }
`;

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AniList HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// countryOfOrigin must be a quoted string scalar — "KR" not KR
export async function fetchTrending(perPage = 6): Promise<AniListManga[]> {
  const query = `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, countryOfOrigin: "KR", sort: [TRENDING_DESC], isAdult: false) {
        ${MANGA_FRAGMENT}
      }
    }
  }`;
  const data = await gql<{ Page: { media: AniListManga[] } }>(query, { perPage });
  return data.Page.media;
}

export async function fetchTopRated(perPage = 12): Promise<AniListManga[]> {
  const query = `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, countryOfOrigin: "KR", sort: [SCORE_DESC], isAdult: false) {
        ${MANGA_FRAGMENT}
      }
    }
  }`;
  const data = await gql<{ Page: { media: AniListManga[] } }>(query, { perPage });
  return data.Page.media;
}

export async function fetchRecentlyUpdated(perPage = 12): Promise<AniListManga[]> {
  const query = `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, countryOfOrigin: "KR", sort: [UPDATED_AT_DESC], isAdult: false, status: RELEASING) {
        ${MANGA_FRAGMENT}
      }
    }
  }`;
  const data = await gql<{ Page: { media: AniListManga[] } }>(query, { perPage });
  return data.Page.media;
}

export async function fetchByID(id: number): Promise<AniListManga | null> {
  const query = `query ($id: Int) {
    Media(id: $id, type: MANGA) {
      ${MANGA_FRAGMENT}
    }
  }`;
  try {
    const data = await gql<{ Media: AniListManga }>(query, { id });
    return data.Media;
  } catch {
    return null;
  }
}

export async function searchManhwa(
  search: string,
  perPage = 8
): Promise<AniListManga[]> {
  const query = `query ($search: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, countryOfOrigin: "KR", search: $search, isAdult: false) {
        ${MANGA_FRAGMENT}
      }
    }
  }`;
  try {
    const data = await gql<{ Page: { media: AniListManga[] } }>(query, {
      search,
      perPage,
    });
    return data.Page.media;
  } catch {
    return [];
  }
}
