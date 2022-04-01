import {
  Form,
  json,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { MetaFunction, LoaderFunction } from "remix";

import { getUser } from "./session.server";
import { AppShell, Burger, Button, Group, Header, MantineProvider, MediaQuery, Navbar, Text, useMantineTheme } from "@mantine/core";
import { FC, useState } from "react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Watchlist",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json<LoaderData>({
    user,
  });
};

const App: FC = () => {
  const { user } = useLoaderData<LoaderData>();
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme()
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={{
          fontFamily: "Roboto, sans-serif",
        }}>
          <AppShell
            // navbarOffsetBreakpoint controls when navbar should no longer be offset with padding-left
            navbarOffsetBreakpoint="sm"
            // fixed prop on AppShell will be automatically added to Header and Navbar
            fixed
            navbar={
              <Navbar
                p="md"
                // Breakpoint at which navbar will be hidden if hidden prop is true
                hiddenBreakpoint="sm"
                // Hides navbar when viewport size is less than value specified in hiddenBreakpoint
                hidden={!opened}
                // when viewport size is less than theme.breakpoints.sm navbar width is 100%
                // viewport size > theme.breakpoints.sm – width is 300px
                // viewport size > theme.breakpoints.lg – width is 400px
                width={{ sm: 125, lg: 125 }}
              >
                {user ? (
                  <>

                    <Button variant="subtle" to={"/lists"} component={Link}>Lists</Button>
                    <Button variant="subtle" to={"/profile"} component={Link}>Profile</Button>
                    <Form style={{ alignSelf: "center" }} action="/logout" method="post"><Button data-testid="logout-button" type="submit" variant="subtle">Logout</Button></Form>
                  </>
                ) : (
                  <>
                    <Button variant="subtle" to={"/login"} component={Link}>Log In</Button>
                    <Button variant="subtle" to={"/join"} component={Link}>Join</Button>
                  </>
                )}
              </Navbar>
            }
            header={
              <Header height={70} p="md">
                {/* Handle other responsive styles with MediaQuery component or createStyles function */}
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </MediaQuery>
                  <Button component={Link} to="/" variant="subtle" size="lg">Watchlist</Button>
                </div>
              </Header>
            }
          >
            <Group direction="column" style={{ minHeight: "100%", minWidth: "100%", alignItems: "flex-start", justifyContent: "flex-start" }}>
              <Outlet />
            </Group>
          </AppShell>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default App;