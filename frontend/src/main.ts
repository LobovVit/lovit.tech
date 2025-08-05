import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import router from "./router"; // ✅ Импорт маршрутизатора

const app = createApp(App);
app.use(router); // ✅ Подключение маршрутизатора
app.mount("#app");