import axios from "axios";

const apiGatewayUrl = import.meta.env.VITE_API_BASE_URL;
const localBackendUrl = import.meta.env.MODE === "development"
  ? "http://localhost:5001/api"
  : "/api"

export const apiGateway = axios.create({ baseURL: apiGatewayUrl, timeout: 5000 });
export const backend = axios.create({ baseURL: localBackendUrl, timeout: 5000 });
