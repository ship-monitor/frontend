import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import "./styles.css";
import { setupClient } from "@/auth";
import api from "@/api";

const app = createApp(App);

app.use(router);
app.mount("#app");

setupClient(api);
