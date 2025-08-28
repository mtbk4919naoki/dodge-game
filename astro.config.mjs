// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://nycreation.jp', // あなたのGitHub PagesのURL
  base: '/dodge-game', // プロジェクト名に合わせたサブディレクトリ
  vite: {
    plugins: [tailwindcss()]
  }
});