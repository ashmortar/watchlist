import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";


export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmailAndOrUsername({ email, username }: { email?: User["email"], username?: User["username"] }): Promise<User | null> {
  let where: { email: string } | { username: string };
  if (email) {
    where = { email }
  } else if (username) {
    where = { username }
  } else {
    throw new Error("No email or username provided");
  }

  return prisma.user.findUnique({
    where
  });
}

export async function createUser({ email, password, username }: { email: User["email"], password: string, username: User["username"] }): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]): Promise<User | null> {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin({ email, username, password }: {
  email: User["email"] | null,
  username: User["username"] | null,
  password: Password["hash"]
}): Promise<User | null> {
  const where = email ? { email } : username ? { username } : {};
  const userWithPassword = await prisma.user.findUnique({
    where,
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
