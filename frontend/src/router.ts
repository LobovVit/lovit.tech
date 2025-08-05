import MainPage from './pages/MainPage.vue'
import AdvertisingPage from './pages/AdvertisingPage.vue'
import SitesPage from './pages/SitesPage.vue'
import MobileAppPage from './pages/MobileAppPage.vue'

export default [
    { path: '/', component: MainPage },
    { path: '/advertising', component: AdvertisingPage },
    { path: '/sites', component: SitesPage },
    { path: '/mobileapp', component: MobileAppPage },
]