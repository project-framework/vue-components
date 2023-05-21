import {
    Router,
    createRouter,
    createWebHistory,
} from 'vue-router';
import uploadRoutes from './modules/upload'

const router: Router = createRouter({
    history: createWebHistory(),
    strict: true,
    routes: [...uploadRoutes],
});

export default router;