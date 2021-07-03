import axios from "axios";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { mocked } from "ts-jest/utils";
import { ApiErrorResponse, ApiError, StartExportResponse, ExportProgressResult, ExportProgressResponse } from "@/types";
import Qualtrics from "@/qualtrics";
import TestUtil from "./util/TestUtil";

jest.mock("axios");
const mockedAxios = mocked(axios, true);

describe("Qualtrics API: Response Export", () => {
	beforeEach(() => {
		mockedAxios.request.mockReset();
	});

	test("When API token is not provided, expect 'bad request' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/badrequest.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: ""});
		await expect(api.startExport("SURVEY-ID", { format: "csv", compress: true }))
			.rejects.toMatchObject<ApiError>({ 
				status: 400,
				statusText: "Bad Request" 
			});
	});

	test("When invalid API token is provided, expect 'unauthorized' error", async () => {
		const mockedError = TestUtil.loadAndParseJson<ApiErrorResponse>("./json/unauthorized.json");
		mockedAxios.request.mockRejectedValueOnce(TestUtil.wrapError(mockedError));

		expect.assertions(1);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "INVALID-API-TOKEN"});
		await expect(api.startExport("SURVEY-ID", { format: "csv", compress: true }))
			.rejects.toMatchObject<ApiError>({ 
				status: 401,
				statusText: "Unauthorized" 
			});
	});

	test("When response export is started, expect progress ID and status", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<StartExportResponse>("./json/startexport.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(4);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const result = await api.startExport("SURVEY-ID", { format: "csv", compress: true });

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(result.progressId).toEqual(expect.any(String));
		expect(result.percentComplete).toEqual(expect.any(Number));
		expect(result.status).toEqual(expect.any(String));
	});

	test("When 'get progress' is requested and the export process is not finished, expect 'inProgress' status", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<ExportProgressResponse>("./json/exportprogress.inprogress.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(2);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const result = await api.getExportProgress("SURVEY-ID", "PROGRESS-ID");

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(result.status).toEqual("inProgress");
	});

	test("When 'get progress' is requested and the export process has failed, expect 'failed' status", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<ExportProgressResponse>("./json/exportprogress.failed.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(2);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const result = await api.getExportProgress("SURVEY-ID", "PROGRESS-ID");

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(result.status).toEqual("failed");
	});

	test("When 'get progress' is requested and the export process has completed, expect 'complete' status", async () => {
		const mockedResponse = TestUtil.loadAndParseJson<ExportProgressResponse>("./json/exportprogress.complete.json");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		expect.assertions(3);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		const result = await api.getExportProgress("SURVEY-ID", "PROGRESS-ID");

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(result.status).toEqual("complete");
		expect(result.fileId).toEqual(expect.any(String));
	});

	test("When 'export file' is requested and has completed, expect the downloaded file", async () => {
		const mockedResponse = Readable.from("12345");
		mockedAxios.request.mockResolvedValueOnce(TestUtil.wrapResponse(mockedResponse));

		const filePath = path.join(__dirname, "./output/exportfile.txt");
		if (fs.existsSync(filePath)) {
			fs.rmSync(filePath);
		}

		expect.assertions(2);

		const api = new Qualtrics.ResponseExport({dataCenter: "syd1", apiToken: "VALID-API-TOKEN"});
		await api.getExportFile("SURVEY-ID", "FILE_ID", filePath);

		expect(mockedAxios.request).toBeCalledTimes(1);
		expect(fs.readFileSync(filePath, "utf-8")).toEqual("12345");
	});
});
