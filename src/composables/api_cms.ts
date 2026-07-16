import axios from "axios";

const cmsApi = axios.create({
  baseURL: "https://cms.ship-monitor.ru",
  timeout: 10000,
});

export default cmsApi;
