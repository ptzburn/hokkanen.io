import { seed } from "./setup/seed.ts";

export default async function globalSetup(): Promise<void> {
  await seed();
}
