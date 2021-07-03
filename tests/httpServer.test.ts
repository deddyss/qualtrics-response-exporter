import { createHttpServer } from "@/http/server";
import Denque from "denque";

describe("Internal HTTP Server", () => {
	test("When a queue is provided and many GET /survey is requested at one time, expect responses in the same order as the queue", async () => {
		// override console.log for the moment
		jest.spyOn(console, "log").mockImplementation(() => {});

		const array = ["1", "2", "3", "4", "5"];
		const queue = new Denque<string>(array);
		const server = createHttpServer(queue);

		const promises: Promise<void>[] = [];
		const responses: Record<string, string> = {};

		// iterate for ten times
		[...Array(10).keys()].forEach((key: number) => {
			promises.push(
				server
					.inject({ method: "GET", url: "/survey" })
					.then((response) => {
						// only proceed OK (200) response
						if (response.statusCode === 200) {
							responses[key + 1 + ""] = response.body;
						}
					})
			);
		});
		await Promise.all(promises);
		expect(Object.values(responses)).toEqual(array);
	});
});
