import { Client } from './clients'
import { HttpClientWrapper } from './http-client-wrapper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const httpClient = new HttpClientWrapper()
export const api = new Client(API_BASE_URL, httpClient)
