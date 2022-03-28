import {
  json,
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
import { AppShell, Burger, Header, MantineProvider, MediaQuery, Navbar, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Watchlist",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

export default function App() {
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
                width={{ sm: 300, lg: 400 }}
              >
                <Text>Application navbar</Text>
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

                  <Text size="lg">Watchlist</Text>
                </div>
              </Header>
            }
          >
            <Outlet />
          </AppShell>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
