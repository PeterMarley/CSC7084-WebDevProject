import fetch from "node-fetch";

export default async function apiCall(httpMethod: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH', url: string, body: URLSearchParams | undefined = undefined, token: string | undefined = undefined) {
	const fetchResponse = await fetch(url, {
		method: httpMethod,
		body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Bearer ' + process.env.REQUESTOR,
			...(token && { 'Cookie': 'token=' + token })
		}
	});
	try {
		return JSON.parse(await fetchResponse.text());
	} catch (err) {
		console.log(`error in apiCall():`);
		console.log(err);
		return { success: false }
	}
}