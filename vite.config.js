import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';



export default defineConfig({
    root: 'src/example/',
    publicDir: '../public',
    plugins: [react()]
});