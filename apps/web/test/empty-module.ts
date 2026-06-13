// Stub for `server-only` under Vitest's node environment. The real package
// throws when imported outside a React Server Component bundle; in unit tests
// we only exercise the in-memory logic, so an empty module is the right shim.
export {};
