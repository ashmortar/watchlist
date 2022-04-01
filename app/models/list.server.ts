import { List, Item, ListMember, User, Rating } from "@prisma/client";
import { nanoid } from "nanoid";

import { prisma } from "~/db.server";
import { MovieResult, TvResult } from "~/services/moviedb.server";

export type { List, Item, ListMember } from "@prisma/client";

export async function getListBySlug(
  slug: List["slug"]
): Promise<
  | (List & {
      items: (Omit<Item, "itemJson"> & { item: MovieResult | TvResult })[];
    } & { members: ListMember[] } & { owner: User })
  | null
> {
  const list = await prisma.list.findUnique({
    where: { slug },
    include: { items: true, members: true, owner: true },
  });
  if (!list) {
    return null;
  }
  const items = list.items.map(({ itemJson, ...rest }) => {
    const item = JSON.parse(itemJson);
    return {
      ...rest,
      item,
    };
  });
  return { ...list, items };
}

export async function getListMember(
  listId: List["id"],
  userId: User["id"]
): Promise<ListMember | null> {
  return prisma.listMember.findUnique({
    where: { userId_listId: { listId, userId } },
  });
}

export async function getUsersLists(userId: User["id"]): Promise<List[]> {
  return prisma.list.findMany({
    where: {
      OR: [
        {
          owner: {
            id: userId,
          },
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });
}

export async function createList(
  ownerId: User["id"],
  name: List["name"]
): Promise<List> {
  return prisma.list.create({
    data: {
      owner: {
        connect: {
          id: ownerId,
        },
      },
      name,
      slug: nanoid(4),
    },
  });
}

export async function joinList(
  listId: List["id"],
  userId: User["id"]
): Promise<ListMember> {
  return prisma.listMember.create({
    data: {
      list: {
        connect: {
          id: listId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function leaveList(
  listId: List["id"],
  userId: User["id"]
): Promise<ListMember> {
  return prisma.listMember.delete({
    where: {
      userId_listId: {
        userId,
        listId,
      },
    },
  });
}

export async function addListItem(
  slug: List["slug"],
  itemData: MovieResult | TvResult
): Promise<Item> {
  return prisma.item.create({
    data: {
      list: {
        connect: {
          slug,
        },
      },
      itemType: itemData.media_type,
      itemJson: JSON.stringify(itemData),
    },
  });
}
export async function removeListItem(itemId: Item["id"]): Promise<Item | null> {
  return prisma.item.delete({ where: { id: itemId } });
}

export async function addRating(
  itemId: Item["id"],
  userId: User["id"],
  watched: boolean,
  rating: number
): Promise<Rating> {
  return prisma.rating.create({
    data: {
      item: {
        connect: {
          id: itemId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      watched,
      rating,
    },
  });
}
