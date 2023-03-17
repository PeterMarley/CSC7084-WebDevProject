import fetch from "node-fetch";
import buildApiUrl from "./buildApiUrl";

//export default async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH', endpoint: string, body: URLSearchParams | undefined = undefined, token: string | undefined = undefined) {
export default async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH', endpoint: string, body: URLSearchParams | undefined = undefined) {
	const opts = {
		method: httpMethod,
		body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': process.env.REQUESTOR ?? '',
			//...(token && { 'Cookie': 'token=' + token })
		}
	};
	const fetchResponse = await fetch(buildApiUrl(endpoint), opts);
	const text = await fetchResponse.text();
	try {
		return JSON.parse(text);
	} catch (err) {
		console.log(`error in apiCall():`);
		console.error(err);
		return { success: false }
	}
}