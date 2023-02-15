export default function buildApiUrl(route: string) {
    let baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/';
    let endpoint = route;
    
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
    
    return baseUrl + endpoint;
}