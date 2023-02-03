import type { LoaderFunction } from "@remix-run/server-runtime"
import { redirect, json } from "@remix-run/server-runtime"

import { getListBySlug, getListMember } from "~/models/list.server"
import { NotFoundResponse } from "~/response-helpers"
import { requireUser } from "~/session.server"

export type $SlugLoaderData = {
  list: Awaited<ReturnType<typeof getListBySlug>>
}

export const $slugLoader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const { slug } = params
  if (typeof slug !== `string`) {
    throw redirect(`/lists`)
  }
  const list = await getListBySlug(slug)
  if (!list) {
    throw NotFoundResponse()
  }
  if (!list.public) {
    const isOwner = list.ownerId === user.id
    const member = await getListMember(list.id, user.id)
    const canView = isOwner || !!member
    if (!canView) {
      throw NotFoundResponse()
    }
  }
  return json<$SlugLoaderData>({ list })
}
