import { Manga, MangaStatus } from "@/lib/types";
import { AniListManga } from "./anilist";

function mapStatus(s: AniListManga["status"]): MangaStatus {
  const map: Record<AniListManga["status"], MangaStatus> = {
    RELEASING: "ongoing",
    FINISHED: "completed",
    HIATUS: "hiatus",
    CANCELLED: "cancelled",
    NOT_YET_RELEASED: "ongoing",
  };
  return map[s] ?? "ongoing";
}

function getStaffByRole(
  edges: AniListManga["staff"]["edges"],
  roles: string[]
): string {
  for (const role of roles) {
    const match = edges.find((e) =>
      e.role.toLowerCase().includes(role.toLowerCase())
    );
    if (match) return match.node.name.full;
  }
  return edges[0]?.node.name.full ?? "Unknown";
}

export function mapAniList(m: AniListManga): Manga {
  const score =
    m.averageScore != null
      ? parseFloat((m.averageScore / 10).toFixed(1))
      : 0;

  return {
    id: m.id.toString(),
    title: m.title.english ?? m.title.romaji ?? m.title.native,
    coverImage: m.coverImage.extraLarge ?? m.coverImage.large,
    synopsis:
      m.description
        ?.replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\n+/g, " ")
        .trim() ?? "",
    genres: m.genres.slice(0, 6),
    themes: m.tags
      .filter(
        (t) =>
          t.category === "Theme" ||
          t.category === "Plot" ||
          t.category === "Setting"
      )
      .slice(0, 8)
      .map((t) => t.name),
    rating: score,
    ratings: {
      anilist: score > 0 ? score : undefined,
    },
    status: mapStatus(m.status),
    chapters: m.chapters ?? 0,
    author: getStaffByRole(m.staff.edges, ["Story", "Author", "Original Story", "Original"]),
    artist: getStaffByRole(m.staff.edges, ["Art", "Illustration", "Character Design"]),
    year: m.startDate.year ?? 0,
    isHot: (m.popularity ?? 0) > 60000,
    isAiPick: score >= 8.0 && (m.popularity ?? 0) > 40000,
  };
}
