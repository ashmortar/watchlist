import type { Dispatch, FC, SetStateAction } from "react"
import React, { useEffect, useMemo, useState } from "react"

import type { SelectItem } from "@mantine/core"
import { MediaQuery, Group, Select, Button } from "@mantine/core"
import { useFetcher, useParams } from "@remix-run/react"
import { debounce } from "lodash"

import { dataMap, listSort } from "~/routes/lists/$slug/helpers"
import type { $SlugLoaderData } from "~/routes/lists/$slug/loader.server"
import type { SearchResult } from "~/routes/multi-search"

import { DropdownItem } from "./DropdownItem"

type Props = {
  setList: Dispatch<SetStateAction<$SlugLoaderData[`list`]>>
  adder: ReturnType<typeof useFetcher>
}

export const FindAndAddItem: FC<Props> = ({ adder }) => {
  const { slug } = useParams()
  const searchFormRef = React.useRef<HTMLFormElement>(null)
  const addItemFormRef = React.useRef<HTMLFormElement>(null)
  const [itemJson, setItemJson] = useState<string>(``)
  const movies = useFetcher<SearchResult>()
  const data = useMemo(
    (): SelectItem[] => movies.data?.results.map(dataMap).sort(listSort) ?? [],
    [movies.data],
  )
  console.log({
    movies,
    data,
    slug,
  })

  useEffect(() => {
    const form = document.getElementById(`search-form`) as HTMLFormElement
    if (!form) return
    const onSearch = debounce(() => {
      movies.submit(searchFormRef.current)
    }, 500)
    form.addEventListener(`keydown`, onSearch)
    return () => {
      form.removeEventListener(`keydown`, onSearch)
    }
  }, [])

  const [search, setSearch] = useState(``)

  return (
    <div style={{ width: `100%` }}>
      <Group
        direction="column"
        styles={{
          width: `100%`,
          flexDirection: `column`,
          alignItems: `flex-start`,
          justifyContent: `flex-start`,
        }}
      >
        <movies.Form
          method="get"
          action="/multi-search"
          id="search-form"
          ref={searchFormRef}
          autoComplete="off"
          style={{ width: `100%` }}
        >
          <input title="query" name="query" type="hidden" value={search} />
          <Select
            label="Search Movies and Television"
            id="query"
            name="query"
            data={data}
            itemComponent={DropdownItem}
            onSearchChange={(query) => setSearch(query)}
            onChange={(value) => {
              const item = data.find((i) => i.value === value)
              if (item) {
                setItemJson(JSON.stringify(item.item))
              } else {
                setItemJson(``)
              }
            }}
            autoComplete="off"
            searchable
            nothingFound="No results"
          />
        </movies.Form>
        <Button
          disabled={!itemJson}
          fullWidth
          type="button"
          onClick={() => adder.submit(addItemFormRef.current)}
        >
          Add
        </Button>
      </Group>
      <adder.Form
        ref={addItemFormRef}
        method="post"
        action={`/lists/${slug}/?index`}
        style={{ display: `hidden`, height: `0` }}
      >
        <input type="hidden" name="itemJson" value={itemJson} />
      </adder.Form>
    </div>
  )
}
