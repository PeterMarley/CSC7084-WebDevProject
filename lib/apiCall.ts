import fetch from "node-fetch";

export default async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE', url: string, body: URLSearchParams | undefined, token: string | undefined = undefined) {
	const fetchResponse = await fetch(url, {
		method: httpMethod,
		body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Bearer ' + process.env.REQUESTOR,
			...(token && { 'Cookie': 'token=' + token })
		}
	});
	const r = await fetchResponse.text();
	try {
		return JSON.parse(r);
	} catch (err) {
		return { success: false }
	}
}