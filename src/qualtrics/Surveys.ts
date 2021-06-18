import { AxiosError, AxiosResponse } from "axios";
import { ApiError, ApiErrorResponse, ListSurveysResponse, Survey, SurveysConfigParams } from "@/types";
import Logger from "@/log/Logger";
import Api from "./Api";

const MODULE = "Surveys";
const URL = "/surveys";

class Surveys extends Api{
	private logger: Logger;

	constructor(config: SurveysConfigParams) {
		super(config);
		this.logger = new Logger(MODULE);
	}

	public listActiveSurvey(): Promise<Array<Survey>> {
		return this.listSurvey(true);
	}

	public listAllSurvey(): Promise<Array<Survey>> {
		return this.listSurvey(false);
	}

	protected listSurvey(activeOnly: boolean): Promise<Array<Survey>> {
		return new Promise<Array<Survey>>((resolve, reject) => {
			this.getSurveys(URL)
				.then(surveys => {
					resolve(
						activeOnly === true ?
							surveys.filter((survey: Survey) => survey.isActive === true) : surveys
					);
				})
				.catch((error: ApiError) => {
					reject(error);
				});
		});
	}

	private getSurveys(url: string): Promise<Array<Survey>> {
		this.logger.debug(
			"Retrieving surveys from URL %s",
			url.startsWith("http") ? url : this.getBaseUrl() + url
		);

		return new Promise<Array<Survey>>((resolve, reject) => {
			this.sendHttpGetRequest<ListSurveysResponse>({ url })
				.then((response: AxiosResponse<ListSurveysResponse>) => {
					const surveys: Array<Survey> = response.data.result.elements;
					const nextPage: string | null = response.data.result.nextPage;
					if (nextPage) {
						this.getSurveys(nextPage)
							.then(nextSurveys => {
								resolve([...surveys, ...nextSurveys]);
							})
							.catch((error: AxiosError<ApiErrorResponse>) => {
								const apiError = this.parseError(error);
								// log
								this.logger.warn(
									"Cannot retrieve next surveys from URL %s due to error: %o", nextPage, apiError
								);
								// resolve anyway
								resolve(surveys);
							});
					}
					else {
						resolve(surveys);
					}
				})
				.catch((error: AxiosError<ApiErrorResponse>) => {
					reject(this.parseError(error));
				});
		})
	}
}

export default Surveys;
