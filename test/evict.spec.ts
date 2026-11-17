import { evictDurableObject } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { test } from "vitest";

test("A: evicts a Durable Object that did not call Artifacts", async () => {
	const stub = env.HOLDER.getByName("a");
	await stub.idle();
	await evictDurableObject(stub);
});

test("B: evicts a Durable Object that called Artifacts and disposed the result", async () => {
	const stub = env.HOLDER.getByName("b");
	await stub.listAndDispose();
	await evictDurableObject(stub);
});

test("C: evicts a Durable Object that called Artifacts", async () => {
	const stub = env.HOLDER.getByName("c");
	await stub.list();
	await evictDurableObject(stub);
});
