export interface Preference {
	dataCenter?: string;
}

export interface Answer extends Preference {
	apiToken?: string;
	savePreferences?: boolean;
	activeSurveyOnly?: boolean;
}

export interface ApiConfigParams {
	dataCenter: string;
	apiToken: string;
}
export interface WhoAmIConfigParams extends ApiConfigParams {}
export interface SurveysConfigParams extends ApiConfigParams {}
export interface ResponseExporterConfigParams extends ApiConfigParams {
	surveyId: string;
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

export interface ApiError {
	status: number;
	statusText: string;
	message?: string;
}
