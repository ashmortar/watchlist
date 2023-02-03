import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime"
import { json, redirect } from "@remix-run/server-runtime"

import {
  addListItem,
  removeListItem,
  getListBySlug,
  getListMember,
} from "~/models/list.server"
import { BadRequestResponse, NotFoundResponse } from "~/response-helpers"
import { requireUser } from "~/session.server"
import { isShowResult } from "~/utils"

import type { $SlugLoaderData } from "./loader.server"

export const $slugAction: ActionFunction = async ({ request, params }) => {
  console.log({ request, params })
  const { slug } = params
  const formData = await request.formData()
  if (typeof slug !== `string`) {
    throw BadRequestResponse()
  }
  if (request.method === `POST`) {
    const itemJson = formData.get(`itemJson`)
    if (typeof itemJson !== `string`) {
      throw BadRequestResponse()
    }
    const item = JSON.parse(itemJson)
    if (!isShowResult(item)) {
      throw BadRequestResponse()
    }
    await addListItem(slug, item)
  } else if (request.method === `DELETE`) {
    const itemId = formData.get(`itemId`)
    if (typeof itemId !== `string`) {
      throw BadRequestResponse()
    }
    await removeListItem(itemId)
  }

  return json({ list: await getListBySlug(slug) })
}

export const loader: LoaderFunction = async ({ request, params }) => {
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
