import type { FC } from "react"
import { useState, useEffect } from "react"

import { Group, MediaQuery, Text } from "@mantine/core"
import { useLoaderData, useFetcher } from "@remix-run/react"

import { FindAndAddItem } from "~/components/FindAndAddItem"
import { ListItem } from "~/components/ListItem"
import { useUser } from "~/utils"

import { $slugAction } from "./action.server"
import type { $SlugLoaderData } from "./loader.server"
import { $slugLoader } from "./loader.server"

export const loader = $slugLoader

export const action = $slugAction

const ListDetailsPage: FC = () => {
  useUser()
  const [list, setList] = useState(useLoaderData<$SlugLoaderData>().list)
  const adder = useFetcher()
  useEffect(() => {
    if (adder.data) {
      setList(adder.data.list)
    }
  }, [adder.data])
  return (
    <>
      <Group
        direction="column"
        style={{
          background: `#FFF`,
          position: `sticky`,
          top: 90,
          width: `100%`,
          padding: `1rem`,
          minHeight: `180px`,
          borderRadius: `5px`,
          maxWidth: `600px`,
          boxShadow: `0px 0px 5px rgba(0,0,0,0.2)`,
          zIndex: 3,
        }}
      >
        <MediaQuery smallerThan="lg" styles={{ fontSize: `14px` }}>
          <Text size="xl">{list?.name}</Text>
        </MediaQuery>
        <FindAndAddItem setList={setList} adder={adder} />
      </Group>
      <div
        style={{
          background: `linear-gradient(to bottom, rgba(255,255,255,1) 85%,rgba(200,200,200,0) 100%)`,
          height: 240,
          width: `100vw`,
          position: `fixed`,
          top: 70,
          zIndex: 2,
        }}
      />
      <ul
        style={{
          width: `100%`,
          maxWidth: `600px`,
          padding: 0,
          margin: 0,
          listStyle: `none`,
          zIndex: 1,
        }}
      >
        {list?.items.map(({ item, id }) => (
          <ListItem key={id} item={item} id={id} adder={adder} />
        ))}
      </ul>
    </>
  )
}

export default ListDetailsPage
