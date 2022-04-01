import { Space, Text, Button, Group } from "@mantine/core";
import { FC } from "react";
import { Link } from "remix";
import { useOptionalUser } from "~/utils";


const Index: FC = () => {
  const user = useOptionalUser();
  return (
    <Group direction="column" style={{ justifyContent: "center" }}>
      <Text size="xl">Welcome to Watchlist</Text>
      <Space h="lg" />
      {user ? (
        <Button style={{ width: "100%" }} variant="subtle" component={Link} to="/lists">your lists</Button>
      ) : (
        <Group>
          <Button variant="subtle" component={Link} to={"/login"}>Login</Button>
          <Text>or</Text>
          <Button variant="subtle" component={Link} to={"/join"}>Join</Button>
        </Group>
      )
      }
    </Group >
  );
}

export default Index;