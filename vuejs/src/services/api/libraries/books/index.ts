import axios from 'axios';
import CONFIG from '@/config';
import { ApiGetLibrariesLidBooks, ApiPostLibrariesLidBooksBody, ApiPostLibrariesLidBooksResult } from '@/types/api';

const API_ROUTE = `${CONFIG.HOSTNAME}/libraries`;

export async function getLibrariesLidBooks(lid: string): Promise<ApiGetLibrariesLidBooks> {
    const response = await axios.get(`${API_ROUTE}/${lid}/books`);
    return response.data;
}

export async function postLibrariesLidBooks(lid: string, body: ApiPostLibrariesLidBooksBody): Promise<ApiPostLibrariesLidBooksResult> {
    const response = await axios.post(`${API_ROUTE}/${lid}/books`, body);
    return response.data;
}

export async function deleteLibrariesLidBooksBid(lid: string, bid: string): Promise<void> {
    await axios.delete(`${API_ROUTE}/${lid}/books/${bid}`);
}

