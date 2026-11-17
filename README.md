# Local Artifacts binding: a Durable Object that calls it cannot be evicted

A Durable Object calls `env.ARTIFACTS.list()` on a local Artifacts binding. After that call, `evictDurableObject()` from `cloudflare:test` does not settle, and the test times out. This happens even when the Durable Object disposes the result of the call.

Since Miniflare 5.20261117.0-beta, the local Artifacts binding wraps the namespace service (`src/workers/artifacts/wrapped-binding.worker.ts`). The wrapper reads each RPC result and returns its value, but it does not dispose the result, and the value that the caller gets has no disposer.

## Versions

- `@cloudflare/vitest-plugin` 1.8.3
- `miniflare` 5.20261117.0-beta (forced for the plugin and for Wrangler in `pnpm-workspace.yaml`)
- `workerd` 1.20261117.1 (forced for Wrangler)
- `wrangler` 4.163.0
- `vitest` 5.1.0

## Requirements

- Node.js 22.12 or newer.
- pnpm 12, as set in `packageManager`. pnpm 12 reads the overrides from `pnpm-workspace.yaml`.
- Git 2.32 or newer on `PATH`. The local Artifacts binding uses native Git and checks for it at startup.

## Run

```sh
pnpm install
pnpm test
```

## The three tests

Each test calls one method of a Durable Object and then awaits `evictDurableObject(stub)`.

- **A** calls a method that does nothing.
- **B** calls `env.ARTIFACTS.list()` and disposes the result (`result[Symbol.dispose]?.()`).
- **C** calls `env.ARTIFACTS.list()` and does not dispose the result.

## What you see

| Miniflare | A | B | C |
| --- | --- | --- | --- |
| 5.20261117.0-beta | passes | times out | times out |
| 5.20261109.0-beta, with workerd 1.20261109.1 | passes | passes | times out |

A test that times out stops after 10 seconds at `await evictDurableObject(stub)`.

To run the older release, change the three versions in `pnpm-workspace.yaml` to `5.20261109.0-beta`, `5.20261109.0-beta` and `1.20261109.1`, delete `node_modules` and `pnpm-lock.yaml`, and install again.

## What you expect

On 5.20261117.0-beta, test B passes, as it does on 5.20261109.0-beta: a caller that disposes its results can be evicted.
