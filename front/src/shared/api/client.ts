import axios from "axios";
import { API_URL } from "@/features/auth/session";

export const api = axios.create({ baseURL: API_URL, withCredentials: true });
