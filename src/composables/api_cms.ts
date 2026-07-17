import axios from "axios";

const cmsApi = axios.create({
  baseURL: "https://cms.ship-monitor.ru",
});

export default cmsApi;
