import type { FC } from "react"

import { Group, Button, Text } from "@mantine/core"
import type { useFetcher } from "@remix-run/react"

import type { Item } from "~/models/list.server"
import type { MovieResult, TvResult } from "~/services/moviedb.server"

type Props = {
  item: MovieResult | TvResult
  id: Item[`id`]
  adder: ReturnType<typeof useFetcher>
}

export const ListItem: FC<Props> = ({ item, adder, id }) => {
  return (
    <li key={item.id} style={{ padding: `1rem 0`, flex: 1 }}>
      <Group
        direction="row"
        style={{
          flex: 1,
          justifyContent: `space-between`,
          boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`,
          transition: `all 0.3s cubic-bezier(.25,.8,.25,1)`,
          padding: `1rem`,
          borderRadius: `5px`,
        }}
      >
        <img
          height="150px"
          src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
          alt={`movie poster`}
        />
        <Group
          direction="column"
          style={{ flex: 1, justifyContent: `flex-start` }}
        >
          <Text>{item.media_type === `movie` ? item.title : item.name}</Text>
          <Text size="xs" color="dimmed">
            {item.vote_average} ⭐ {item.vote_count} votes
          </Text>
        </Group>
        <Group direction="row">
          <Button
            style={{ width: 100 }}
            type="button"
            onClick={() => {
              const data = new FormData()
              data.append(`itemId`, id)
              adder.submit(data, { method: `delete` })
            }}
          >
            Remove
          </Button>
        </Group>
      </Group>
    </li>
  )
}
