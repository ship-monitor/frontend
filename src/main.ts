import { createApp } from "vue";
import App from "@/App.vue";
import { createAppRouter } from "@/router";
import "./styles.css";
import { createPinia } from "pinia";

const app = createApp(App);

app.use(createPinia()).use(createAppRouter());
app.mount("#app");
