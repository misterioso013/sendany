const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

export default API_URL;
