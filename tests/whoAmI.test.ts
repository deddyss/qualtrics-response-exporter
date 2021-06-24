import axios from "axios";
import { mocked } from "ts-jest/utils";
import { ApiErrorResponse, ApiError, WhoAmIResponse } from "@/types";
import Qualtrics from "@/qualtrics";
import TestUtil from "./util/TestUtil";

jest.mock("axios");
const mockedAxios = mocked(axios, true);

describe("API: Who Am I", () => {
	beforeEach(() => {
		mockedAxios.request.mockReset();
	});

	test("When API token is not provided, expect 'bad request' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/badrequest.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.WhoAmI({dataCenter: "syd1", apiToken: ""});
		await expect(api.userInfo()).rejects.toMatchObject<ApiError>({ 
			status: 400,
			statusText: "Bad Request" 
		});
	});

	test("When invalid API token is provided, expect 'unauthorized' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/unauthorized.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.WhoAmI({dataCenter: "syd1", apiToken: "INVALID-API-TOKEN"});
		await expect(api.userInfo()).rejects.toMatchObject<ApiError>({ 
			status: 401,
			statusText: "Unauthorized" 
		});
	});

	test("When valid API token is provided, expect user info", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<WhoAmIResponse>("./json/whoami.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(2);

		const api = new Qualtrics.WhoAmI({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const user = await (api.userInfo());

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(user.firstName).toBe("John");
	});

});
