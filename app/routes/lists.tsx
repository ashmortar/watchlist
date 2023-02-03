import type { FC } from "react"

import { Outlet } from "@remix-run/react"
import type { LoaderFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"

import { getUsersLists } from "~/models/list.server"
import { requireUserId } from "~/session.server"

export type LoaderData = {
  lists: Awaited<ReturnType<typeof getUsersLists>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const lists = await getUsersLists(userId)
  return json<LoaderData>({ lists })
}

const ListsPage: FC = () => {
  return <Outlet />
}

export default ListsPage
