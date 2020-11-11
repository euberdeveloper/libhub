import axios from 'axios';
import CONFIG from '@/config';
import { ApiGetLibraries, ApiGetLibrariesLid, ApiPostLibrariesBody, ApiPostLibrariesResult } from '@/types/api';

const API_ROUTE = `${CONFIG.HOSTNAME}/libraries`;

export async function getLibraries(): Promise<ApiGetLibraries> {
    const response = await axios.get(`${API_ROUTE}`);
    return response.data;
}

export async function getLibrariesLid(lid: string): Promise<ApiGetLibrariesLid> {
    const response = await axios.get(`${API_ROUTE}/${lid}`);
    return response.data;
}

export async function postLibraries(body: Partial<ApiPostLibrariesBody>): Promise<ApiPostLibrariesResult> {
    const response = await axios.post(`${API_ROUTE}`, body);
    return response.data;
}

export async function deleteLibrariesLid(lid: string): Promise<void> {
    await axios.delete(`${API_ROUTE}/${lid}`);
}

