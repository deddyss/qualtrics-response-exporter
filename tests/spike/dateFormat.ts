const now = new Date();
const offset = now.getTimezoneOffset() * 60 * 1000;
const localDate = new Date(now.getTime() - offset);
const formatted = localDate.toISOString().slice(0, 19).replace(/:/g, ".").replace("T", " ");
console.log(formatted);