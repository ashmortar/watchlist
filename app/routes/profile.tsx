import { Container, Space, Text } from "@mantine/core";
import { FC } from "react";
import { ActionFunction, json, LoaderFunction, useLoaderData } from "remix";
import { requireUser } from "~/session.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>;
};

export const action: ActionFunction = async ({ request }) => {};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await requireUser(request),
  });
};

const Profile: FC = () => {
  const { user } = useLoaderData<LoaderData>();
  return (
    <Container>
      <Text size="xl">Profile</Text>
      <Space h="lg" />
      <Text>{user.email}</Text>
      <Text>{user.username}</Text>
      <Text>User since {new Date(user.createdAt).toDateString()}</Text>
    </Container>
  );
};

export default Profile;
