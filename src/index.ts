import { DurableObject } from "cloudflare:workers";

interface Env {
	ARTIFACTS: { list(): Promise<Partial<Disposable>> };
}

export class Holder extends DurableObject<Env> {
	async idle(): Promise<void> {}

	async list(): Promise<void> {
		await this.env.ARTIFACTS.list();
	}

	async listAndDispose(): Promise<void> {
		const result = await this.env.ARTIFACTS.list();
		result[Symbol.dispose]?.();
	}
}

export default {
	fetch: () => new Response("ok"),
};
