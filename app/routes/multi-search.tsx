import type { LoaderFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"

import { search } from "~/services/moviedb.server"
import type { TvResult, MovieResult } from "~/services/moviedb.server"

export type SearchResult = {
  results: (MovieResult | TvResult)[]
  page: number
  query: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const query = url.searchParams.get(`query`)
  const page = parseInt(url.searchParams.get(`page`) ?? `1`) ?? 1
  console.log(`search`, query, page)
  if (!query) {
    return json({ results: [], page: 1, query: `` })
  }
  return json({ query, ...(await search({ query, page })) })
}
