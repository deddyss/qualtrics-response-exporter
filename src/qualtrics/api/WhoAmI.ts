import { AxiosResponse, AxiosError } from "axios";
import { ApiConfiguration, ApiErrorResponse, User, WhoAmIResponse } from "@/types";
import Api from "./Api";

const URL = "/whoami";

class WhoAmI extends Api {

	constructor(config: ApiConfiguration) {
		super(config);
	}

	public userInfo(): Promise<User> {
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
