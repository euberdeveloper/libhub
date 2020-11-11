import axios from 'axios';
import CONFIG from '@/config';
import { ApiGetLabels, ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPostLabelsResult } from '@/types/api';

const API_ROUTE = `${CONFIG.HOSTNAME}/labels`;

export async function getLabels(): Promise<ApiGetLabels> {
    console.log(`${API_ROUTE}`)
    const response = await axios.get(`${API_ROUTE}`);
    return response.data;
}

export async function postLabels(body: Partial<ApiPostLabelsBody>): Promise<ApiPostLabelsResult> {
    const response = await axios.post(`${API_ROUTE}`, body);
    return response.data;
}

export async function patchLabelLid(lid: string, body: Partial<ApiPatchLabelsLidBody>): Promise<void> {
    const response = await axios.patch(`${API_ROUTE}/${lid}`, body);
    return response.data;
}

export async function deleteLabelsLid(lid: string): Promise<void> {
    await axios.delete(`${API_ROUTE}/${lid}`);
}

