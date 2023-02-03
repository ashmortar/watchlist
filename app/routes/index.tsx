import type { FC } from "react"

import { Space, Text, Button, Group } from "@mantine/core"
import { Link } from "@remix-run/react"

import { useOptionalUser } from "~/utils"

const Index: FC = () => {
  const user = useOptionalUser()
  return (
    <Group direction="column" style={{ justifyContent: `center` }}>
      <Text size="xl">Welcome to Watchlist</Text>
      <Space h="lg" />
      {user ? (
        <Button
          style={{ width: `100%` }}
          data-testid="your-lists"
          variant="subtle"
          component={Link}
          to="/lists"
        >
          your lists
        </Button>
      ) : (
        <Group>
          <Button
            data-testid="login-button"
            variant="subtle"
            component={Link}
            to={`/login`}
          >
            Login
          </Button>
          <Text>or</Text>
          <Button
            data-testid="join-button"
            variant="subtle"
            component={Link}
            to={`/join`}
          >
            Join
          </Button>
        </Group>
      )}
    </Group>
  )
}

export default Index
