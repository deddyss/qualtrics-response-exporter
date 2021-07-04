import { RateLimiter } from "limiter";
import { AxiosError, AxiosResponse } from "axios";
import { createWriteStream, WriteStream } from "fs";
import { Stream } from "stream";
import { 
	ApiConfiguration, ApiError, ApiErrorResponse, ExportProgressResponse, ExportProgressResult,
	StartExportRequestData, StartExportResponse, StartExportResult
} from "@/types";
import Api from "./Api";

const startExportUrl = (surveyId: string) => `/surveys/${surveyId}/export-responses`;
const exportProgressUrl = (surveyId: string, progressId: string) => `/surveys/${surveyId}/export-responses/${progressId}`;
const exportFileUrl = (surveyId: string, fileId: string) => `/surveys/${surveyId}/export-responses/${fileId}/file`;

const startExportLimiter = new RateLimiter({ tokensPerInterval: 100, interval: "minute" });
const exportProgressLimiter = new RateLimiter({ tokensPerInterval: 1000, interval: "minute" });
const exportFileLimiter = new RateLimiter({ tokensPerInterval: 100, interval: "minute" });

class ResponseExport extends Api {
	constructor (config: ApiConfiguration) {
		super(config);
	}

	public async startExport(surveyId: string, data: StartExportRequestData)
		: Promise<StartExportResult> {
		await startExportLimiter.removeTokens(1);

		return new Promise<StartExportResult>((resolve, reject) => {
			this.sendHttpPostRequest<StartExportResponse>({ 
				url: startExportUrl(surveyId),
				data,
				headers: {
					"Content-Type": "application/json"
				}
			}).then((response: AxiosResponse<StartExportResponse>) => {
					resolve(response.data.result);
				})
				.catch((error: AxiosError<ApiErrorResponse>) => {
					const apiError: ApiError = this.parseError(error);
					reject(new Error(apiError.message ? apiError.message : apiError.statusText));
				});
		});
	}

	public async getExportProgress(surveyId: string, progressId: string): Promise<ExportProgressResult> {
		await exportProgressLimiter.removeTokens(1);

		return new Promise<ExportProgressResult>((resolve, reject) => {
			this.sendHttpGetRequest<ExportProgressResponse>({ url: exportProgressUrl(surveyId, progressId) })
				.then((response: AxiosResponse<ExportProgressResponse>) => {
					resolve(response.data.result);
				})
				.catch((error: AxiosError<ApiErrorResponse>) => {
					const apiError: ApiError = this.parseError(error);
					reject(new Error(apiError.message ? apiError.message : apiError.statusText));
				});
		});
	}

	public async getExportFile(surveyId: string, fileId: string, filePath: string): Promise<void> {
		await exportFileLimiter.removeTokens(1);

		return new Promise<void>((resolve, reject) => {
			const stream: WriteStream = createWriteStream(filePath);
			this.sendHttpGetFileStreamRequest({ url: exportFileUrl(surveyId, fileId) })
				.then((response: AxiosResponse<Stream>) => {
					response.data.pipe(stream);
					let writeStreamError: Error | undefined;
					stream.on("error", (error: Error) => {
						writeStreamError = error;
						stream.close();
						reject(writeStreamError);
					});
					stream.on("close", () => {
						if (!writeStreamError) {
							resolve();
						}
						else {
							reject(writeStreamError);
						}
					});
				})
		});
	}
}

export default ResponseExport;
