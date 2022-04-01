import { Button, Group, Text } from '@mantine/core'
import { FC } from 'react'
import { Link } from 'remix'

import { useLists } from '~/utils'

const ListsIndexPage: FC = () => {
    const lists = useLists()
    return (
        <>
            <Group style={{ alignItems: "flex-start" }}>
                <Text size="xl">Your Lists</Text>
                <Button style={{ padding: 0, alignItems: "flex-end" }} variant='subtle' to="/lists/create" component={Link}>Create a New List </Button>
            </Group>
            {lists.length > 0 ? (
                <ul style={{ padding: 0, listStyle: "none" }}>
                    {lists.map((list) => (
                        <li key={list.id}>
                            <Button style={{ padding: 0 }} variant='subtle' size="lg" component={Link} to={`/lists/${list.slug}`}>{list.name}</Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <Text>You have no lists</Text>
            )}
        </>
    )
}

export default ListsIndexPage