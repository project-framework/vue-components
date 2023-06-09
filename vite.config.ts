import { resolve } from "path";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { /* ElementPlusResolver, */ AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    plugins: [
        vue(),
        vueJsx(),
        AutoImport({
            resolvers: [AntDesignVueResolver()],
        }),
        Components({
            resolvers: [AntDesignVueResolver()],
        }),
    ],
});
