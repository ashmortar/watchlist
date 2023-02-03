import type { SelectItem } from "@mantine/core"

import type { MovieResult, TvResult } from "~/services/moviedb.server"

export const listSort = (a: SelectItem, b: SelectItem): number => {
  if (a.item.media_type < b.item.media_type) return -1
  if (a.item.media_type > b.item.media_type) return 1
  return (
    b.item.popularity - a.item.popularity ||
    b.item.vote_count - a.item.vote_count ||
    b.item.vote_average - a.item.vote_average
  )
}

export const dataMap = (
  r: MovieResult | TvResult,
  _i: number,
  _a: (MovieResult | TvResult)[],
): SelectItem => ({
  label: r.media_type === `movie` ? r.title : r.name,
  value: r.id.toString(),
  group: r.media_type === `movie` ? `Movies` : `TV Shows`,
  item: r,
})
