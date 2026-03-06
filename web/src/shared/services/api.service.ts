import axios from 'axios';
import { API_URL } from '../constants/app.constants';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15_000,
});
