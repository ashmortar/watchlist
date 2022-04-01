import { json } from "remix";
import { search } from "~/services/moviedb.server";
import type { LoaderFunction } from "remix";
import type { TvResult, MovieResult } from "~/services/moviedb.server";

export type SearchResult = {
  results: (TvResult | MovieResult)[];
  page: number;
  query: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const page = parseInt(url.searchParams.get("page") ?? "1") ?? 1;
  if (!query) {
    return json({ results: [], page: 1, query: "" });
  }
  return json({ query, ...(await search({ query, page })) });
};
