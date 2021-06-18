import debug, { Debugger } from "debug";

export const PREFIX = "Qualtrics";

class Logger {
	private _debug: Debugger;
	private _warn: Debugger;
	private _error: Debugger;

	constructor(module?: string) {
		if (module) {
			this._debug = debug(`${PREFIX}:${module}`);
			this._warn = debug(`${PREFIX}:WARN:${module}`);
			this._error = debug(`${PREFIX}:ERROR:${module}`);
		}
		else {
			this._debug = debug(PREFIX);
			this._warn = debug(`${PREFIX}:WARN`);
			this._error = debug(`${PREFIX}:ERROR`);
		}
		/* eslint-disable */
		this._debug.log = console.info.bind(console);
		this._warn.log = console.warn.bind(console);
		this._error.log = console.error.bind(console);
		/* eslint-enable */
	}

	get debug():Debugger {
		return this._debug;
	}

	get warn():Debugger {
		return this._warn;
	}

	get error():Debugger {
		return this._error;
	}
}

export default Logger;
