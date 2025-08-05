import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'

const routes = [
    { path: '/', component: MainPage },
    { path: '/advertising', component: MainPage },
    { path: '/audit', component: MainPage },
    { path: '/sites', component: MainPage },
    { path: '/mobileapp', component: MainPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router