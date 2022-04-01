import { Button, Container, Group, Space, Text, TextInput } from '@mantine/core'
import { FC } from 'react'
import { ActionFunction, Form, json, redirect } from 'remix'
import { createList } from '~/models/list.server'
import { requireUserId } from '~/session.server'
import { useUser } from '~/utils'

type ActionData = {
    errors: {
        name?: string
    }
}

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request)
    const formData = await request.formData();
    const name = formData.get("name");

    if (typeof name !== "string") {
        return json<ActionData>(
            { errors: { name: "Name is required" } },
            { status: 400 }
        );
    }
    if (name.length < 3) {
        return json<ActionData>(
            { errors: { name: "Name must be at least 3 characters" } },
            { status: 400 }
        );
    }
    const list = await createList(userId, name)
    return redirect(`/lists/${list.slug}`)
}

const CreatePage: FC = () => {
    useUser()
    return (
        <>
            <Text size="xl">Create A New List</Text>
            <Form method='post' action="/lists/create" style={{ width: "400px", maxWidth: "80%" }}>
                <TextInput name="name" label="Name" />
                <Space h="xl" />
                <Button type="submit">Create</Button>
            </Form>
        </>
    )
}

export default CreatePage