import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Advertising from "../views/Advertising.vue";
import Sites from "../views/Sites.vue";
import MobileApp from "../views/MobileApp.vue";

const routes: RouteRecordRaw[] = [
    { path: "/", component: Home },
    { path: "/advertising", component: Advertising },
    { path: "/sites", component: Sites },
    { path: "/mobileapp", component: MobileApp },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;