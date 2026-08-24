import axios from "axios";

const DEFAULT_CMS_URL = "https://cms.ship-monitor.ru";

const cmsApi = axios.create({
  baseURL: import.meta.env.VITE_CMS_URL || DEFAULT_CMS_URL,
  timeout: 10000,
});

export default cmsApi;
