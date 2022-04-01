import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Form,
  json,
  Link,
  useActionData,
  redirect,
  useSearchParams,
} from "remix";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { FC, useEffect, useRef } from "react";
import { Button, Container, Group, Input, Space, Switch, Text, TextInput } from "@mantine/core";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
    username?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");
  const remember = formData.get("remember");

  if (!username && !email) {
    return json<ActionData>(
      { errors: { username: "Username or email is required", email: "Email or username is required" } },
      { status: 400 }
    );
  }

  if (username && typeof username !== 'string') {
    return json<ActionData>(
      { errors: { username: "Username is invalid" } },
      { status: 400 }
    );
  }

  if (email && !validateEmail(email)) {
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

  const user = await verifyLogin({ username, email, password });

  if (!user) {
    return json<ActionData>(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/notes",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};


const LoginPage: FC = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/lists";
  const actionData = useActionData() as ActionData;
  const emailRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Text size="xl">Log In to your Account</Text>
      <Space h="xl" />
      <Form method="post">
        <Group style={{ justifyContent: "space-between" }}>
          <Group style={{ flexGrow: "1" }} direction="column">
            <TextInput
              style={{ width: "100%" }}
              ref={userNameRef}
              id="username"
              label="Username"
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
          </Group>
          <Text style={{ paddingTop: 20 }} size="sm">or</Text>
          <Group style={{ flexGrow: "1" }} direction="column">
            <TextInput
              style={{ width: "100%" }}
              ref={emailRef}
              id="email"
              label="Email address"
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
          </Group>
        </Group>
        <TextInput
          id="password"
          label="Password"
          ref={passwordRef}
          name="password"
          required
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
              Log in
            </Button>
            <Switch name="remember" id="remember" label="Remember me?" />
          </Group>
          <Space h="md" />
          <Group spacing="sm">
            <Text size="sm">
              Need an account?
            </Text>
            <Button
              variant="subtle"
              component={Link}
              to={{
                pathname: "/join",
                search: searchParams.toString(),
              }}
            >
              Sign up
            </Button>
          </Group>
        </Group>
      </Form>
    </Container>
  );
}

export default LoginPage;