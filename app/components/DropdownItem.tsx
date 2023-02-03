import { forwardRef } from "react"

import type { SelectItemProps } from "@mantine/core"
import { Group, MediaQuery, Text } from "@mantine/core"

import type { MovieResult, TvResult } from "~/services/moviedb.server"

export interface ItemProps extends SelectItemProps {
  item: MovieResult | TvResult
}

export const DropdownItem = forwardRef<HTMLDivElement, ItemProps>(
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
            <MediaQuery smallerThan="sm" styles={{ size: `sm` }}>
              <Text>{item.media_type === `movie` ? item.title : item.name}</Text>
            </MediaQuery>
            <Text size="xs" color="dimmed">
              {item.vote_average} ⭐ {item.vote_count} votes
            </Text>
          </Group>
        </Group>
      </Group>
    </div>
  ),
)

DropdownItem.displayName = `DropdownItem`
