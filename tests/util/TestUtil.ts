import { ApiErrorResponse, ApiResponse } from "@/types";
import { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";

class TestUtil {

	public static loadAndParseJson<T>(filePath: string): T {
		const content = fs.readFileSync(path.join(__dirname, "../", filePath), "utf-8");
		return JSON.parse(content) as T;
	}

	public static wrapResponse<T>(object: T): AxiosResponse<T> {
		return { data: object } as AxiosResponse<T>; 
	}

	public static wrapError(object: ApiErrorResponse): AxiosError<ApiErrorResponse> {
		const statuses = object.meta.httpStatus.split(" - ");
		const response = {
			status: parseInt(statuses[0], 10),
			statusText: statuses[1],
			data: object
		} as AxiosResponse<ApiErrorResponse>;
		return { response } as AxiosError<ApiErrorResponse>;
	}
}

export default TestUtil;
