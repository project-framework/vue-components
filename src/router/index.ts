import {
    Router,
    createRouter,
    createWebHistory,
} from 'vue-router';
import uploadRoutes from './modules/upload'
import chartsRoutes from './modules/echarts'

const router: Router = createRouter({
    history: createWebHistory(),
    strict: true,
    routes: [
        ...uploadRoutes,
        ...chartsRoutes
    ],
});

export default router;