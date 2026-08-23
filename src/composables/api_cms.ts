import axios from "axios";

// TODO(config): Read and validate VITE_CMS_URL and set a finite timeout instead of hard-coding production and allowing requests to hang indefinitely.
const cmsApi = axios.create({
  baseURL: "https://cms.ship-monitor.ru",
});

export default cmsApi;
