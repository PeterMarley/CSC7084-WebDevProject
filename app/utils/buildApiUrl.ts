import config from "../../common/config/Config";
const port = config.connection.port;

export default function buildApiUrl(route: string) {
    if (!port) throw new Error('cannot read port from config in apiCall()');

    let baseUrl = (process.env.API_BASE_URL + ':' ?? 'https://localhost:') + port + '/';
    let endpoint = route;
    
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
    
    return baseUrl + endpoint;
}