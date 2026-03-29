import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongoose";
import { clientPromise } from "@/lib/mongodb";
import { User } from "@/models/User";

function validateAuthEnv() {
  const secret = process.env.NEXTAUTH_SECRET;
  const invalidSecrets = new Set([
    "replace-with-a-long-random-secret",
    "your-nextauth-secret",
    "changeme",
  ]);

  if (
    !secret ||
    secret.trim().length < 32 ||
    invalidSecrets.has(secret.trim().toLowerCase())
  ) {
    throw new Error(
      "Invalid NEXTAUTH_SECRET. Set a long random value (at least 32 characters) in your environment.",
    );
  }
}

validateAuthEnv();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectToDatabase();
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        })
          .select("+passwordHash")
          .lean();

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await compare(
          credentials.password,
          user.passwordHash,
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return session.user;
}
