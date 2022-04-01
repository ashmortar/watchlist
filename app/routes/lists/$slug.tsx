import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useParams,
} from "remix";

import { FC, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  SelectItem,
  Container,
  Group,
  Select,
  SelectItemProps,
  Space,
  Text,
  TextIn,
  SelectItemput,
  Button,
  AspectRatio,
} from "@mantine/core";
import { useUser } from "~/utils";
import { MovieResult, TvResult } from "~/services/moviedb.server";
import {
  addListItem,
  getListBySlug,
  getListMember,
} from "~/models/list.server";
import { SearchResult } from "../multi-search";
import { requireUser } from "~/session.server";
import { BadRequestResponse, NotFoundResponse } from "~/response-helpers";

export type LoaderData = {
  list: Awaited<ReturnType<typeof getListBySlug>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const itemJson = formData.get("itemJson");
  const { slug } = params;
  if (typeof itemJson !== "string" || typeof slug !== "string") {
    throw BadRequestResponse();
  }
  await addListItem(slug, JSON.parse(itemJson));
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
            <Text>{item.media_type === "movie" ? item.title : item.name}</Text>
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
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 85%,rgba(200,200,200,0) 100%)",
          zIndex: 2,
          position: "sticky",
          top: 70,
          width: "100%",
          padding: "1rem",
          height: "180px",
        }}
      >
        <Text size="xl">{list?.name}</Text>
        <Group
          style={{
            alignItems: "flex-end",
            justifyContent: "space-between",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <movies.Form
            method="get"
            action="/multi-search"
            ref={searchRef}
            autoComplete="off"
          >
            <Select
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
              wrapperProps={{ style: { width: "400px" } }}
              nothingFound="No results"
            />
          </movies.Form>
          <Button
            disabled={!itemJson}
            style={{ width: 100 }}
            type="button"
            onClick={() => adder.submit(formRef.current)}
          >
            Add
          </Button>
        </Group>
      </Group>
      <adder.Form ref={formRef} method="post" action={`/lists/${slug}`}>
        <input type="hidden" name="itemJson" value={itemJson} />
      </adder.Form>
      <ul
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: 0,
          listStyle: "none",
        }}
      >
        {list?.items.map(({ item }) => (
          <li key={item.id} style={{ padding: "1rem 0", flex: 1 }}>
            <Group
              direction="row"
              style={{ flex: 1, justifyContent: "space-between" }}
            >
              <img
                height={150}
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
                  disabled
                  onClick={() =>
                    adder.submit(formRef.current, { method: "delete" })
                  }
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
