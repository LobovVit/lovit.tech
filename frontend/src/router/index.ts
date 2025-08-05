import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
    { path: '/', component: HomeView },
    // заглушки на будущее
    { path: '/advertising', component: HomeView },
    { path: '/audit', component: HomeView },
    { path: '/sites', component: HomeView },
    { path: '/mobileapp', component: HomeView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router