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

export interface ResponseExportStatus {
	percentComplete: number;
	status: "complete" | "failed" | "inProgress";
	continuationToken?: string;
}
export interface StartExportRequestData {
	format: string;
	compress: boolean;
	allowContinuation?: string;
	continuationToken?: string;
}
export interface StartExportResult extends ResponseExportStatus{
	progressId: string;
}
export interface ExportProgressResult extends ResponseExportStatus{
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

export interface PoolParam {
	port: number;
	apiToken: string;
	dataCenter: string;
	exportWithContinuation: boolean;
	exportFormat: string;
	compressExportFile: boolean;
}
export interface RunnableParam extends PoolParam{
	id: string;
}
export type Runnable = (param: RunnableParam) => Promise<void>;

export class ProgressBar extends SingleBar {}
