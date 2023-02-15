import fetch from "node-fetch";
import buildApiUrl from "./buildApiUrl";

export default async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH', endpoint: string, body: URLSearchParams | undefined = undefined, token: string | undefined = undefined) {
	const url = buildApiUrl(endpoint);
	console.log(url);
	
	const fetchResponse = await fetch(
		url,
		{
			method: httpMethod,
			body,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + process.env.REQUESTOR,
				...(token && { 'Cookie': 'token=' + token })
			}
		}
	);
	const text = await fetchResponse.text();
	console.log(text);
	
	
	try {
		return JSON.parse(text);
	} catch (err) {
		console.log(`error in apiCall():`);
		console.log(err);
		return { success: false }
	}
}