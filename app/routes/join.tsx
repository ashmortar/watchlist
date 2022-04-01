import * as React from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Form,
  Link,
  redirect,
  useSearchParams,
  json,
  useActionData,
} from "remix";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmailAndOrUsername } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { Container, Space, TextInput, Input, Group, Button, Switch, Text } from "@mantine/core";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
    username?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");
  const redirectTo = formData.get("redirectTo");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  if (typeof username !== "string") {
    return json<ActionData>(
      { errors: { username: "Username is required" } },
      { status: 400 }
    );
  }

  if (username.length < 3) {
    return json<ActionData>(
      { errors: { username: "Username is too short" } },
      { status: 400 }
    );
  }


  const existingUser = await getUserByEmailAndOrUsername({ email, username });
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const user = await createUser({ email, password, username });

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

const Join: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const usernameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Text size="xl">Join Watchlist</Text>
      <Space h="xl" />
      <Form method="post">
        <TextInput
          ref={usernameRef}
          id="username"
          label="Username"
          required
          autoFocus={true}
          name="username"
          type="text"
          autoComplete="username"
          aria-invalid={actionData?.errors?.username ? true : undefined}
          aria-describedby="username-error"
        />
        {actionData?.errors?.email && (
          <Text size="sm" color="red" id="email-error">
            {actionData.errors.email}
          </Text>
        )}
        <TextInput
          ref={emailRef}
          id="email"
          label="Email address"
          required
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={actionData?.errors?.email ? true : undefined}
          aria-describedby="email-error"
        />
        {actionData?.errors?.email && (
          <Text size="sm" color="red" id="email-error">
            {actionData.errors.email}
          </Text>
        )}

        <TextInput
          id="password"
          label="Password"
          required
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={actionData?.errors?.password ? true : undefined}
          aria-describedby="password-error"
        />
        {actionData?.errors?.password && (
          <Text size="sm" color="red" id="password-error">
            {actionData.errors.password}
          </Text>
        )}

        <Input type="hidden" name="redirectTo" value={redirectTo} />
        <Space h="md" />
        <Group style={{ justifyContent: "space-between" }}>
          <Group spacing="lg">
            <Button
              type="submit"
            >
              Sign up
            </Button>
            <Switch name="remember" id="remember" label="Remember me?" />
          </Group>
          <Space h="md" />
          <Group spacing="sm">
            <Text size="sm">
              Have an account?
            </Text>
            <Button
              variant="subtle"
              component={Link}
              to={{
                pathname: "/login",
                search: searchParams.toString(),
              }}
            >
              Log in
            </Button>
          </Group>
        </Group>

      </Form>
    </Container>
  );
}

export default Join