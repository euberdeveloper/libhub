import axios from 'axios';
import CONFIG from '@/config';
import { ApiPostLibrariesLidSchemaUbicationsBody } from '@/types/api';

const API_ROUTE = `${CONFIG.HOSTNAME}/libraries`;

export async function postLibrariesLidSchemaUbications(lid: string, body: ApiPostLibrariesLidSchemaUbicationsBody): Promise<void> {
   await axios.post(`${API_ROUTE}/${lid}/schema/ubications`, body);
}

export async function deleteLibrariesLidSchemaUbicationsUbication(lid: string, ubication: string): Promise<void> {
   await axios.delete(`${API_ROUTE}/${lid}/schema/ubications/${ubication}`);
}

