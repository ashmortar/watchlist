import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  useFetcher,
  useLoaderData,
  useParams,
} from "remix";

import { FC, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  SelectItem,
  Group,
  Select,
  SelectItemProps,
  Text,
  Button,
  MediaQuery,
} from "@mantine/core";
import { useUser } from "~/utils";
import { MovieResult, TvResult } from "~/services/moviedb.server";
import {
  addListItem,
  getListBySlug,
  getListMember,
  removeListItem,
} from "~/models/list.server";
import { SearchResult } from "../multi-search";
import { requireUser } from "~/session.server";
import { BadRequestResponse, NotFoundResponse } from "~/response-helpers";

function isItem(item: any): item is MovieResult | TvResult {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "number" &&
    (item.media_type === "movie" || item.media_type === "tv")
  );
}

export type LoaderData = {
  list: Awaited<ReturnType<typeof getListBySlug>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { slug } = params;
  const formData = await request.formData();
  if (typeof slug !== "string") {
    throw BadRequestResponse();
  }
  if (request.method === "POST") {
    const itemJson = formData.get("itemJson");
    if (typeof itemJson !== "string") {
      throw BadRequestResponse();
    }
    const item = JSON.parse(itemJson);
    if (!isItem(item)) {
      throw BadRequestResponse();
    }
    await addListItem(slug, item);
  } else if (request.method === "DELETE") {
    const itemId = formData.get("itemId");
    if (typeof itemId !== "string") {
      throw BadRequestResponse();
    }
    await removeListItem(itemId);
  }

  return json({ list: await getListBySlug(slug) });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const { slug } = params;
  if (typeof slug !== "string") {
    throw redirect("/lists");
  }
  const list = await getListBySlug(slug);
  if (!list) {
    throw NotFoundResponse();
  }
  if (!list.public) {
    const isOwner = list.ownerId === user.id;
    const member = await getListMember(list.id, user.id);
    const canView = isOwner || !!member;
    if (!canView) {
      throw NotFoundResponse();
    }
  }
  return json<LoaderData>({ list });
};

interface ItemProps extends SelectItemProps {
  item: TvResult | MovieResult;
}

const DropdownItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ item, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Group direction="row">
          {(item.poster_path || item.backdrop_path) && (
            <img
              height={70}
              src={`https://image.tmdb.org/t/p/w500${
                item.poster_path ?? item.backdrop_path
              }`}
              alt={`movie poster for ${others.label}`}
            />
          )}
          <Group direction="column">
            <MediaQuery smallerThan="sm" styles={{ size: "sm" }}>
              <Text>
                {item.media_type === "movie" ? item.title : item.name}
              </Text>
            </MediaQuery>
            <Text size="xs" color="dimmed">
              {item.vote_average} ⭐ {item.vote_count} votes
            </Text>
          </Group>
        </Group>
      </Group>
    </div>
  )
);

const listSort = (a: SelectItem, b: SelectItem) => {
  if (a.item.media_type < b.item.media_type) return -1;
  if (a.item.media_type > b.item.media_type) return 1;
  return (
    b.item.popularity - a.item.popularity ||
    b.item.vote_count - a.item.vote_count ||
    b.item.vote_average - a.item.vote_average
  );
};

const dataMap = (
  r: TvResult | MovieResult,
  _i: number,
  _a: (TvResult | MovieResult)[]
): SelectItem => ({
  label: r.media_type === "movie" ? r.title : r.name,
  value: r.id.toString(),
  group: r.media_type === "movie" ? "Movies" : "TV Shows",
  item: r,
});

const ListPage: FC = () => {
  useUser();
  const { slug } = useParams();
  const [list, setList] = useState(useLoaderData<LoaderData>().list);
  const searchRef = useRef<HTMLFormElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const movies = useFetcher<SearchResult>();
  const adder = useFetcher();
  const [itemJson, setItemJson] = useState<string>("");
  const data = useMemo(
    (): SelectItem[] => movies.data?.results.map(dataMap).sort(listSort) ?? [],
    [movies.data]
  );
  useEffect(() => {
    if (adder.data) {
      setList(adder.data.list);
    }
  }, [adder.data]);

  return (
    <>
      <Group
        direction="column"
        style={{
          background: "#FFF",
          zIndex: 1000,
          position: "sticky",
          top: 90,
          width: "100%",
          padding: "1rem",
          minHeight: "180px",
          borderRadius: "5px",
          maxWidth: "600px",
          boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
        }}
      >
        <Text size="xl">{list?.name}</Text>
        <Group
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <movies.Form
            method="get"
            action="/multi-search"
            ref={searchRef}
            autoComplete="off"
            style={{ flex: 2 }}
          >
            <Select
              style={{ width: "100%" }}
              label="Search Movies and Television"
              id="query"
              name="query"
              data={data}
              itemComponent={DropdownItem}
              onSearchChange={() => movies.submit(searchRef.current)}
              onChange={(value) => {
                const item = data.find((i) => i.value === value);
                if (item) {
                  setItemJson(JSON.stringify(item.item));
                } else {
                  setItemJson("");
                }
              }}
              autoComplete="off"
              searchable
              nothingFound="No results"
            />
          </movies.Form>
          <Button
            disabled={!itemJson}
            type="button"
            onClick={() => adder.submit(formRef.current)}
          >
            Add
          </Button>
        </Group>
        <adder.Form
          ref={formRef}
          method="post"
          action={`/lists/${slug}`}
          style={{ display: "hidden", height: "0" }}
        >
          <input type="hidden" name="itemJson" value={itemJson} />
        </adder.Form>
      </Group>
      <div
        style={{
          zIndex: 900,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 30%,rgba(200,200,200,0) 100%)",
          height: 30,
          width: "100vw",
          position: "fixed",
          top: 260,
        }}
      />
      <ul
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: 0,
          margin: 0,
          listStyle: "none",
          zIndex: 1,
        }}
      >
        {list?.items.map(({ item, id }) => (
          <li key={item.id} style={{ padding: "1rem 0", flex: 1, zIndex: 1 }}>
            <Group
              direction="row"
              style={{
                flex: 1,
                justifyContent: "space-between",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
                padding: "1rem",
                borderRadius: "5px",
              }}
            >
              <img
                height="150px"
                style={{ zIndex: 1 }}
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={`movie poster`}
              />
              <Group
                direction="column"
                style={{ flex: 1, justifyContent: "flex-start" }}
              >
                <Text>
                  {item.media_type === "movie" ? item.title : item.name}
                </Text>
                <Text size="xs" color="dimmed">
                  {item.vote_average} ⭐ {item.vote_count} votes
                </Text>
              </Group>
              <Group direction="row">
                <Button
                  style={{ width: 100 }}
                  type="button"
                  onClick={() => {
                    const data = new FormData();
                    data.append("itemId", id);
                    adder.submit(data, { method: "delete" });
                  }}
                >
                  Remove
                </Button>
              </Group>
            </Group>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ListPage;
