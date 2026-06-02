export type ReadingStatus =
  | "reading"
  | "completed"
  | "on-hold"
  | "dropped"
  | "plan-to-read";

export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled";

export interface MangaRatings {
  anilist?: number;
  mal?: number;
  mangaupdates?: number;
  webtoon?: number;
}

export interface Manga {
  id: string;
  title: string;
  coverImage: string;
  synopsis: string;
  genres: string[];
  themes: string[];
  rating: number;
  ratings: MangaRatings;
  status: MangaStatus;
  chapters: number;
  author: string;
  artist: string;
  year: number;
  isAiPick?: boolean;
  isHot?: boolean;
}

export interface LibraryEntry {
  mangaId: string;
  manga: Manga;
  status: ReadingStatus;
  progress: number;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Manga[];
  timestamp: Date;
}
