import axios from "axios";
import { mocked } from "ts-jest/utils";
import { ApiErrorResponse, ApiError, ListSurveysResponse } from "@/types";
import Qualtrics from "@/qualtrics";
import TestUtil from "./util/TestUtil";

jest.mock("axios");
const mockedAxios = mocked(axios, true);

describe("Qualtrics API: Surveys", () => {
	beforeEach(() => {
		mockedAxios.request.mockReset();
	});

	test("When API token is not provided, expect 'bad request' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/badrequest.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: ""});
		await expect(api.listAllSurvey()).rejects.toMatchObject<ApiError>({ 
			status: 400,
			statusText: "Bad Request" 
		});
	});

	test("When invalid API token is provided, expect 'unauthorized' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/unauthorized.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "INVALID-API-TOKEN"});
		await expect(api.listAllSurvey()).rejects.toMatchObject<ApiError>({ 
			status: 401,
			statusText: "Unauthorized" 
		});
	});

	test("When user has only 3 surveys and wants to list all of them, expect 3 surveys", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(2);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const surveys = await (api.listAllSurvey());

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(surveys.length).toBe(3);
	});

	test("When user has 3 surveys with 1 inactive and wants to list the active one, expect 2 surveys", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(2);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const surveys = await (api.listActiveSurvey());

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(surveys.length).toBe(2);
	});

	test("When user has many surveys and wants to list all of them, expect all the surveys", async () => {
		const mockedResponse1 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.1.json");
		const mockedResponse2 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.2.json");
		const mockedResponse3 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.3.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse1));
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse2));
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse3));

		expect.assertions(2);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const surveys = await (api.listAllSurvey());

		expect(mockedAxios.request).toBeCalledTimes(3);
		expect(surveys.length).toBe(9);
	});

	test("When user has many surveys and wants to list all of them, but an error happened at last request, expect some of the surveys only", async () => {
		const mockedResponse1 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.1.json");
		const mockedResponse2 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.2.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse1));
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse2));
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/notfound.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(2);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const surveys = await (api.listAllSurvey());

		expect(mockedAxios.request).toBeCalledTimes(3);
		expect(surveys.length).toBe(6);
	});

	test("When user has many surveys and wants to list the active one, expect some of the surveys", async () => {
		const mockedResponse1 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.1.json");
		const mockedResponse2 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.2.json");
		const mockedResponse3 = TestUtil.loadAndParseJson<ListSurveysResponse>("./json/surveys.3.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse1));
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse2));
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse3));

		expect.assertions(2);

		const api = new Qualtrics.Surveys({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const surveys = await (api.listActiveSurvey());

		expect(mockedAxios.request).toBeCalledTimes(3);
		expect(surveys.length).toBe(5);
	});
});
