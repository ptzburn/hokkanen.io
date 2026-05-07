import { render } from "@solidjs/testing-library";
import type { SelectSession, SelectUser } from "~/types/auth.ts";
import { createSignal, type JSX } from "solid-js";

import { describe, expect, it } from "vitest";
import { SessionProvider, useSession } from "./session-context.tsx";

const mockUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
} as unknown as SelectUser;

const mockSession = {
  id: 1,
  token: "abc",
  userId: 1,
} as unknown as SelectSession;

function Consumer(): JSX.Element {
  const ctx = useSession();
  return (
    <span>
      {ctx.user.email}|{ctx.session.token}
    </span>
  );
}

describe("SessionProvider", () => {
  it("exposes the user and session to consumers", () => {
    const { container } = render(() => (
      <SessionProvider user={mockUser} session={mockSession}>
        <Consumer />
      </SessionProvider>
    ));
    expect(container.textContent).toContain("alice@example.com|abc");
  });

  it("re-flows when the user prop changes", () => {
    const [user, setUser] = createSignal(mockUser);
    const { container } = render(() => (
      <SessionProvider user={user()} session={mockSession}>
        <Consumer />
      </SessionProvider>
    ));
    expect(container.textContent).toContain("alice@example.com");

    setUser(
      { ...mockUser, email: "bob@example.com" } as unknown as SelectUser,
    );
    expect(container.textContent).toContain("bob@example.com");
  });
});

describe("useSession", () => {
  it("throws when used outside the provider", () => {
    expect(() =>
      render(() => {
        useSession();
        return null;
      })
    ).toThrow("useSession must be used within SessionProvider");
  });
});
