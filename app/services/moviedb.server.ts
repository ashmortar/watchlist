const BASE_URL = `https://api.themoviedb.org/3`

const MULTI_SEARCH = `/search/multi`

const API_KEY = process.env.THE_MOVIE_DB_API_KEY ?? ``

export enum RequestMethod {
  GET = `GET`,
  PATCH = `PATCH`,
  POST = `POST`,
  PUT = `PUT`,
  DELETE = `DELETE`,
}

interface RequestParams {
  path: string
  method?: RequestMethod
}

export interface GetRequestParams extends RequestParams {
  method: RequestMethod.GET
  searchParams?: URLSearchParams
}

async function makeRequest<T>({
  method,
  searchParams = new URLSearchParams(),
  path,
}: GetRequestParams): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set(`api_key`, API_KEY)
  searchParams.forEach((value, key) => url.searchParams.append(key, value))
  const s = url.toString()
  const response = await fetch(s, { method })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`)
  }
  const data = await response.json()
  return data
}

/* SEARCH  */
export type SearchParams = {
  query?: string
  include_adult?: boolean
  page?: number
}
const DEFAULT_PARAMS: SearchParams = {
  include_adult: false,
  page: 1,
  query: `b`,
}
export type TvResult = {
  poster_path: string | null
  popularity: number
  id: number
  overview: string
  backdrop_path: string | null
  vote_average: number
  media_type: `tv`
  first_air_date: string
  origin_country: string[]
  genre_ids: number[]
  original_language: string
  vote_count: number
  name: string
  original_name: string
}
export type MovieResult = {
  poster_path: string
  adult: boolean
  overview: string
  release_date: string
  original_title: string
  genre_ids: number[]
  id: number
  media_type: `movie`
  original_language: string
  title: string
  backdrop_path: string
  popularity: number
  vote_count: number
  video: boolean
  vote_average: number
}
export type PersonResult = {
  profile_path: string
  adult: boolean
  id: number
  media_type: `person`
  known_for: (MovieResult | TvResult)[]
  name: string
  popularity: number
}
export type MultiSearchResult = {
  page: number
  results: (MovieResult | PersonResult | TvResult)[]
}
export const search = async (
  params: SearchParams = DEFAULT_PARAMS,
): Promise<MultiSearchResult> => {
  const searchParams = new URLSearchParams()
  Object.entries({ ...DEFAULT_PARAMS, ...params }).forEach(([key, value]) => {
    searchParams.set(key, String(value))
  })
  console.log({ searchParams })
  const result = await makeRequest<MultiSearchResult>({
    method: RequestMethod.GET,
    path: MULTI_SEARCH,
    searchParams,
  })
  console.log({ result })
  return result
}
