import { searchManhwa } from "@/lib/api/anilist";
import { mapAniList } from "@/lib/api/mapper";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return Response.json({ error: "Query too short" }, { status: 400 });
    }
    const results = await searchManhwa(query.trim(), 4);
    return Response.json(results.map(mapAniList));
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
