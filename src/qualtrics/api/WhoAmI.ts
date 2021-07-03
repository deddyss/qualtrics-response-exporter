import { AxiosResponse, AxiosError } from "axios";
import { ApiErrorResponse, User, WhoAmIConfigParams, WhoAmIResponse } from "@/types";
import Api from "./Api";

const MODULE = "WhoAmI";
const URL = "/whoami";

class WhoAmI extends Api {

	constructor(config: WhoAmIConfigParams) {
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
