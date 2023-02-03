import { useMemo } from "react"

import { useMatches } from "@remix-run/react"

import type { User } from "~/models/user.server"

import type { List } from "./models/list.server"
import type { MovieResult, TvResult } from "./services/moviedb.server"

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  )
  return route?.data
}

function isUser(user: unknown): user is User {
  if (typeof user !== `object` || user === null) {
    return false
  }
  const keys: (keyof User)[] = [`id`, `email`]
  return keys.reduce<boolean>((acc, key) => {
    if (!acc) return acc
    return Object.prototype.hasOwnProperty.call(user, key)
  }, true)
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData(`root`)
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      `No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.`,
    )
  }
  return maybeUser
}

export function validateEmail(email: unknown): email is string {
  return typeof email === `string` && email.length > 3 && email.includes(`@`)
}

export function useLists(): List[] {
  const data = useMatchesData(`routes/lists`)
  if (!data || !Array.isArray(data.lists)) {
    return []
  }
  return data.lists
}

export function isMovieResult(result: unknown): result is MovieResult {
  if (typeof result !== `object` || result === null) {
    return false
  }
  if ((result as MovieResult).media_type !== `movie`) {
    return false
  }

  const keys: (keyof MovieResult)[] = [
    `id`,
    `title`,
    `poster_path`,
    `backdrop_path`,
    `overview`,
    `vote_count`,
    `vote_average`,
    `popularity`,
  ]
  return keys.reduce<boolean>((acc, key) => {
    if (!acc) return acc
    return Object.prototype.hasOwnProperty.call(result, key)
  }, true)
}

export function isTvResult(result: unknown): result is TvResult {
  if (typeof result !== `object` || result === null) {
    return false
  }
  if ((result as TvResult).media_type !== `tv`) {
    return false
  }

  const keys: (keyof TvResult)[] = [
    `id`,
    `name`,
    `poster_path`,
    `backdrop_path`,
    `overview`,
    `vote_count`,
    `vote_average`,
    `popularity`,
  ]
  return keys.reduce<boolean>((acc, key) => {
    if (!acc) return acc
    return Object.prototype.hasOwnProperty.call(result, key)
  }, true)
}

export function isShowResult(item: unknown): item is MovieResult | TvResult {
  return isMovieResult(item) || isTvResult(item)
}
