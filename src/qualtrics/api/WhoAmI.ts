import { AxiosResponse, AxiosError } from "axios";
import { ApiErrorResponse, User, WhoAmIConfigParams, WhoAmIResponse } from "@/types";
import Logger from "@/log/Logger";
import Api from "./Api";

const MODULE = "WhoAmI";
const URL = "/whoami";

class WhoAmI extends Api {
	private logger: Logger;

	constructor(config: WhoAmIConfigParams) {
		super(config);
		this.logger = new Logger(MODULE);
	}

	public userInfo(): Promise<User> {
		this.logger.debug("Retrieving user information from URL %s%s", this.getBaseUrl(), URL);

		return new Promise<User>((resolve, reject) => {
			this.sendHttpGetRequest<WhoAmIResponse>({ url: URL })
				.then((response: AxiosResponse<WhoAmIResponse>) => {
					resolve(response.data.result);
				})
				.catch((error: AxiosError<ApiErrorResponse>) => {
					reject(this.parseError(error));
				});
		});
	}
}

export default WhoAmI;
