import { FC } from "react";
import { LoaderFunction, json, Outlet } from "remix";

import { getUsersLists } from "~/models/list.server";
import { requireUserId } from "~/session.server";

export type LoaderData = {
  lists: Awaited<ReturnType<typeof getUsersLists>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const lists = await getUsersLists(userId);
  return json<LoaderData>({ lists });
};

const ListsPage: FC = () => {
  return <Outlet />;
};

export default ListsPage;
