import { SingleBar } from "cli-progress";

export interface Map<T> {
	[key: string]: T;
}

export interface Preferences {
	dataCenter?: string;
	activeSurveyOnly?: boolean;
	lastSelectedSurveys?: string[];
	exportWithContinuation?: boolean;
	exportFormat?: string;
	compressExportFile?: boolean;
}

export interface Answer extends Preferences {
	apiToken?: string;
	loadPreferences?: boolean;
	selectedSurveys?: string[];
	savePreferences?: boolean;
}

export interface ApiConfiguration {
	dataCenter: string;
	apiToken: string;
}

export interface Error {
	errorMessage: string;
	errorCode: string;
}
export interface Meta {
	httpStatus: string;
	requestId: string;
	notice?: string;
}
export interface MetaWithError extends Meta {
	error: Error;
}

export interface User {
	brandId?: string;
	userId?: string;
	userName?: string;
	accountType?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	datacenter?: string;
}

export interface Survey {
	id: string;
	name: string;
	ownerId: string;
	lastModified: string;
	creationDate: string;
	isActive: boolean;
}
export interface ListSurveysResult {
	elements: Array<Survey>;
	nextPage: string | null;
}

export type ResponseExportStatus = "complete" | "failed" | "inProgress" | undefined;
export interface ResponseExportProgress {
	percentComplete: number;
	status: ResponseExportStatus;
	continuationToken?: string;
}
export interface StartExportRequestData {
	format: string;
	compress: boolean;
	allowContinuation?: boolean;
	continuationToken?: string;
}
export interface StartExportResult extends ResponseExportProgress {
	progressId: string;
}
export interface ExportProgressResult extends ResponseExportProgress {
	fileId?: string;
}

export interface ApiResponse {
	meta: Meta;
}
export interface ApiErrorResponse {
	meta: MetaWithError;
}
export interface WhoAmIResponse extends ApiResponse {
	result: User;
}
export interface ListSurveysResponse extends ApiResponse {
	result: ListSurveysResult;
}
export interface StartExportResponse extends ApiResponse {
	result: StartExportResult;
}
export interface ExportProgressResponse extends ApiResponse {
	result: ExportProgressResult;
}

export interface ApiError {
	status: number;
	statusText: string;
	message?: string;
}

export interface PoolOptions extends ApiConfiguration {
	internalApiPort: number;
	surveys: Survey[],
	exportWithContinuation: boolean;
	exportFormat: string;
	compressExportFile: boolean;
	exportFileDirectory: string;
	logFilePath: string;
}
export interface RunnableOptions extends PoolOptions{
	id: string;
}
export type Runnable = (options: RunnableOptions) => Promise<void>;

export class ProgressBar extends SingleBar {}
interface ExportFailedRequestBody {
	surveyId: string;
	errorMessage: string;
}
export interface ExportFailedSurvey {
	id: string;
	name: string;
	error: string;
}
