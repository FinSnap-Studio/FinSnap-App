import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { spawnSync } from "node:child_process";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

const STATIC_ROUTES = [
  "/login",
  "/register",
  "/dashboard",
  "/wallets",
  "/transactions",
  "/budgets",
  "/categories",
  "/debts",
  "/shopping",
  "/settings",
  "/~offline",
];

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: STATIC_ROUTES.map((url) => ({ url, revision })),
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withSerwist(nextConfig);
