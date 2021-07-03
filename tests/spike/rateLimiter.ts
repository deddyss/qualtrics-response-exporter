import { RateLimiter } from "limiter";

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: "second"});

const printTime = async () => {
	await limiter.removeTokens(1);
	console.log(new Date().toISOString());
};

console.log("start");
[...Array(10).keys()].forEach(() => {
	printTime();
});
