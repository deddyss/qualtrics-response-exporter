import path from "path";
import app from "app-root-path";

export const INFORMATION = {
	USER: {
		LOAD: "Loading user information",
		FAIL: "Cannot retrieve user information"
	},
	SURVEY: {
		LOAD: {
			ALL: "Retrieving all your surveys",
			ACTIVE: "Retrieving your active surveys"
		},
		FAIL: "Cannot retrieve survey list"
	}
};

export const DIRECTORY = {
	SETTING: path.join(app.path, "./setting"),
	OUTPUT: path.join(app.path, "./output"),
	LOG: path.join(app.path, "./log")	
}

export const DATA_CENTERS = {
	"ca1": "Canadian",
	"fra1": "European Union",
	"gov1": "US Government",
	"iad1": "Washington, DC",
	"sin1": "Singapore",
	"sjc1": "San Joze, California",
	"syd1": "Sydney, Australia"
};

export const INTERNAL_API_URL = {
	SURVEY: "/survey",
	EXPORT: {
		SUCCESS: "/export/success",
		FAILED: "/export/failed"
	}
};
