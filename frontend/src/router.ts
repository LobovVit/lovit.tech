import { createRouter, createWebHistory } from "vue-router";

import MainPage from "./pages/MainPage.vue";
import AdvertisingPage from "./pages/AdvertisingPage.vue";
import SitesPage from "./pages/SitesPage.vue";
import MobileAppPage from "./pages/MobileAppPage.vue";

const routes = [
    { path: "/", component: MainPage },
    { path: "/advertising", component: AdvertisingPage },
    { path: "/sites", component: SitesPage },
    { path: "/mobileapp", component: MobileAppPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;