import axios from 'axios';
import CONFIG from '@/config';
import { ApiGetIsbn } from '@/types/api';

const API_ROUTE = `${CONFIG.HOSTNAME}/isbn`;

export async function getIsbn(isbn: string): Promise<ApiGetIsbn> {
    const result = await axios.get(`${API_ROUTE}/${isbn}`);
    return result.data;
}
