import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import * as fs from 'fs';

export default({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({
    plugins: [react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
    root: path.join(__dirname, "src"),
    base: `${process.env.VITE_BASE_URL}${process.env.VITE_BASE_PUBLIC}`,
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    },
  build: {
        outDir: path.join(__dirname, "public"),
        manifest: true,
        rollupOptions: {
          input: path.join(__dirname, "src/main.tsx"),
          output: {
            entryFileNames: "assets/[name].js",
            chunkFileNames: "assets/[name].js",
            assetFileNames: ({name}) => {
              if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')){
                return 'assets/images/[name].[ext]';
            }
            return 'assets/[name].[ext]';
            },
          },
        },
      },
    esbuild: { loader: "tsx", include: /src\/.*\.tsx?$/, exclude: [] },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "tsx"
        },
        plugins: [
          {
            name: "load-js-files-as-tsx",
            setup(build) {
              build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => {
                try {
                  const contents = await fs.promises.readFile(args.path, 'utf8');
                  return {
                    loader: 'tsx',
                    contents,
                  };
                } catch (error) {
                  console.error('Error reading file:', error);
                  return null;
                }
              });
            },
          },
        ],
      },
    },
  })
};
