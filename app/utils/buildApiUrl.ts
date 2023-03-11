export default function buildApiUrl(route: string) {
    let baseUrl = process.env.API_BASE_URL ?? 'https://localhost:443/';
    let endpoint = route;
    
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
    
    return baseUrl + endpoint;
}