export default function buildApiUrl(route: string) {
    return (process.env.API_BASE_URL || 'http://localhost:3000') + route;
}