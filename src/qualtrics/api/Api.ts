import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiConfigParams, ApiErrorResponse, MetaWithError, ApiError } from "@/types";

class Api {
	private baseUrl: string;
	private apiToken: string;

	constructor (config: ApiConfigParams) {
		this.baseUrl = `https://${config.dataCenter}.qualtrics.com/API/v3`;
		this.apiToken = config.apiToken;
	}

	protected getBaseUrl(): string {
		return this.baseUrl;
	}

	protected sendHttpGetRequest<T>(options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
		return axios.request<T>({
			...options,
			...this.defaultAxiosRequestConfig(options),
			...{
				method: "get"
			}
		});
	}

	protected sendHttpGetFileRequest<T>(options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
		return axios.request<T>({
			...options,
			...this.defaultAxiosRequestConfig(options),
			...{
				method: "get",
				responseType: "arraybuffer"
			}
		});
	}

	protected sendHttpPostRequest<T>(options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
		return axios.request<T>({
			...options,
			...this.defaultAxiosRequestConfig(options),
			...{ 
				method: "post",
				transformRequest: [
					data => JSON.stringify(data)
				]
			}
		});
	}

	protected parseError(error: AxiosError<ApiErrorResponse>): ApiError {
		const { response, request, message } = error;
		if (response) {
			const { status, statusText, data } = response;
			const apiError: ApiError = { status, statusText };
			if (data && data.meta && data.meta.error) {
				apiError.message = data.meta.error.errorMessage;
			}
			return apiError;
		}
		else if (request) {
			return { status: -1, statusText: "The request was made but no response was received" };
		}
		else {
			return { status: -2, statusText: "Something happened in setting up the request", message };
		}
	}

	private defaultAxiosRequestConfig(options: AxiosRequestConfig): AxiosRequestConfig {
		const headers: any = options.headers || {};
		headers["x-api-token"] = this.apiToken;
		return {
			...options,
			...{
				headers, baseURL: this.baseUrl, responseType: "json"
			}
		};
	}
}

export default Api;
