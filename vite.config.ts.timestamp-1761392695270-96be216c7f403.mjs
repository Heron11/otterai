// vite.config.ts
import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/@remix-run+dev@2.10.0_@remix-run+react@2.10.2_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_qwyxqdhnwp3srgtibfrlais3ge/node_modules/@remix-run/dev/dist/index.js";
import UnoCSS from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/unocss@0.61.3_postcss@8.4.38_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/unocss/dist/vite.mjs";
import { defineConfig } from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.9_sass@1.77.6/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/vite-plugin-node-polyfills@0.22.0_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { optimizeCssModules } from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/vite-plugin-optimize-css-modules@1.1.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-optimize-css-modules/dist/index.mjs";
import tsconfigPaths from "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-tsconfig-paths/dist/index.mjs";

// load-context.ts
import "file:///Users/heron/Desktop/otter2/otterai/node_modules/.pnpm/wrangler@3.63.2_@cloudflare+workers-types@4.20240620.0/node_modules/wrangler/wrangler-dist/cli.js";
var getLoadContext = ({ context }) => {
  return {
    cloudflare: context.cloudflare,
    CLERK_PUBLISHABLE_KEY: context.cloudflare.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: context.cloudflare.env.CLERK_SECRET_KEY
  };
};

// vite.config.ts
var vite_config_default = defineConfig((config) => {
  return {
    build: {
      target: "esnext"
    },
    plugins: [
      nodePolyfills({
        include: ["path", "buffer"]
      }),
      config.mode !== "test" && remixCloudflareDevProxy({ getLoadContext }),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true
        },
        serverModuleFormat: "esm"
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === "production" && optimizeCssModules({ apply: "build" })
    ]
  };
});
function chrome129IssuePlugin() {
  return {
    name: "chrome129IssuePlugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers["user-agent"]?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader("content-type", "text/html");
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>'
            );
            return;
          }
        }
        next();
      });
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibG9hZC1jb250ZXh0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2hlcm9uL0Rlc2t0b3Avb3R0ZXIyL290dGVyYWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9oZXJvbi9EZXNrdG9wL290dGVyMi9vdHRlcmFpL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9oZXJvbi9EZXNrdG9wL290dGVyMi9vdHRlcmFpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbiBhcyByZW1peENsb3VkZmxhcmVEZXZQcm94eSwgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuaW1wb3J0IHsgb3B0aW1pemVDc3NNb2R1bGVzIH0gZnJvbSAndml0ZS1wbHVnaW4tb3B0aW1pemUtY3NzLW1vZHVsZXMnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgeyBnZXRMb2FkQ29udGV4dCB9IGZyb20gJy4vbG9hZC1jb250ZXh0JztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgICBpbmNsdWRlOiBbJ3BhdGgnLCAnYnVmZmVyJ10sXG4gICAgICB9KSxcbiAgICAgIGNvbmZpZy5tb2RlICE9PSAndGVzdCcgJiYgcmVtaXhDbG91ZGZsYXJlRGV2UHJveHkoeyBnZXRMb2FkQ29udGV4dCB9KSxcbiAgICAgIHJlbWl4Vml0ZVBsdWdpbih7XG4gICAgICAgIGZ1dHVyZToge1xuICAgICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxuICAgICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxuICAgICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZlck1vZHVsZUZvcm1hdDogJ2VzbScsXG4gICAgICB9KSxcbiAgICAgIFVub0NTUygpLFxuICAgICAgdHNjb25maWdQYXRocygpLFxuICAgICAgY2hyb21lMTI5SXNzdWVQbHVnaW4oKSxcbiAgICAgIGNvbmZpZy5tb2RlID09PSAncHJvZHVjdGlvbicgJiYgb3B0aW1pemVDc3NNb2R1bGVzKHsgYXBwbHk6ICdidWlsZCcgfSksXG4gICAgXSxcbiAgfTtcbn0pO1xuXG5mdW5jdGlvbiBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnY2hyb21lMTI5SXNzdWVQbHVnaW4nLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJhdyA9IHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J10/Lm1hdGNoKC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8pO1xuXG4gICAgICAgIGlmIChyYXcpIHtcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gcGFyc2VJbnQocmF3WzJdLCAxMCk7XG5cbiAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gMTI5KSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAndGV4dC9odG1sJyk7XG4gICAgICAgICAgICByZXMuZW5kKFxuICAgICAgICAgICAgICAnPGJvZHk+PGgxPlBsZWFzZSB1c2UgQ2hyb21lIENhbmFyeSBmb3IgdGVzdGluZy48L2gxPjxwPkNocm9tZSAxMjkgaGFzIGFuIGlzc3VlIHdpdGggSmF2YVNjcmlwdCBtb2R1bGVzICYgVml0ZSBsb2NhbCBkZXZlbG9wbWVudCwgc2VlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vc3RhY2tibGl0ei9ib2x0Lm5ldy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTIzOTU1MTkyNThcIj5mb3IgbW9yZSBpbmZvcm1hdGlvbi48L2E+PC9wPjxwPjxiPk5vdGU6PC9iPiBUaGlzIG9ubHkgaW1wYWN0cyA8dT5sb2NhbCBkZXZlbG9wbWVudDwvdT4uIGBwbnBtIHJ1biBidWlsZGAgYW5kIGBwbnBtIHJ1biBzdGFydGAgd2lsbCB3b3JrIGZpbmUgaW4gdGhpcyBicm93c2VyLjwvcD48L2JvZHk+JyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaGVyb24vRGVza3RvcC9vdHRlcjIvb3R0ZXJhaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2hlcm9uL0Rlc2t0b3Avb3R0ZXIyL290dGVyYWkvbG9hZC1jb250ZXh0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9oZXJvbi9EZXNrdG9wL290dGVyMi9vdHRlcmFpL2xvYWQtY29udGV4dC50c1wiO2ltcG9ydCB7IHR5cGUgUGxhdGZvcm1Qcm94eSB9IGZyb20gJ3dyYW5nbGVyJztcblxudHlwZSBDbG91ZGZsYXJlID0gT21pdDxQbGF0Zm9ybVByb3h5PEVudj4sICdkaXNwb3NlJz47XG5cbmRlY2xhcmUgbW9kdWxlICdAcmVtaXgtcnVuL2Nsb3VkZmxhcmUnIHtcbiAgaW50ZXJmYWNlIEFwcExvYWRDb250ZXh0IHtcbiAgICBjbG91ZGZsYXJlOiBDbG91ZGZsYXJlO1xuICAgIENMRVJLX1BVQkxJU0hBQkxFX0tFWT86IHN0cmluZztcbiAgICBDTEVSS19TRUNSRVRfS0VZPzogc3RyaW5nO1xuICB9XG59XG5cbnR5cGUgR2V0TG9hZENvbnRleHQgPSAoYXJnczogeyBjb250ZXh0OiB7IGNsb3VkZmxhcmU6IENsb3VkZmxhcmUgfSB9KSA9PiB7XG4gIGNsb3VkZmxhcmU6IENsb3VkZmxhcmU7XG4gIENMRVJLX1BVQkxJU0hBQkxFX0tFWT86IHN0cmluZztcbiAgQ0xFUktfU0VDUkVUX0tFWT86IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRMb2FkQ29udGV4dDogR2V0TG9hZENvbnRleHQgPSAoeyBjb250ZXh0IH0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBjbG91ZGZsYXJlOiBjb250ZXh0LmNsb3VkZmxhcmUsXG4gICAgQ0xFUktfUFVCTElTSEFCTEVfS0VZOiBjb250ZXh0LmNsb3VkZmxhcmUuZW52LkNMRVJLX1BVQkxJU0hBQkxFX0tFWSxcbiAgICBDTEVSS19TRUNSRVRfS0VZOiBjb250ZXh0LmNsb3VkZmxhcmUuZW52LkNMRVJLX1NFQ1JFVF9LRVksXG4gIH07XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUixTQUFTLGdDQUFnQyx5QkFBeUIsY0FBYyx1QkFBdUI7QUFDbFksT0FBTyxZQUFZO0FBQ25CLFNBQVMsb0JBQXdDO0FBQ2pELFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sbUJBQW1COzs7QUNMbVEsT0FBbUM7QUFrQnpULElBQU0saUJBQWlDLENBQUMsRUFBRSxRQUFRLE1BQU07QUFDN0QsU0FBTztBQUFBLElBQ0wsWUFBWSxRQUFRO0FBQUEsSUFDcEIsdUJBQXVCLFFBQVEsV0FBVyxJQUFJO0FBQUEsSUFDOUMsa0JBQWtCLFFBQVEsV0FBVyxJQUFJO0FBQUEsRUFDM0M7QUFDRjs7O0FEaEJBLElBQU8sc0JBQVEsYUFBYSxDQUFDLFdBQVc7QUFDdEMsU0FBTztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLGNBQWM7QUFBQSxRQUNaLFNBQVMsQ0FBQyxRQUFRLFFBQVE7QUFBQSxNQUM1QixDQUFDO0FBQUEsTUFDRCxPQUFPLFNBQVMsVUFBVSx3QkFBd0IsRUFBRSxlQUFlLENBQUM7QUFBQSxNQUNwRSxnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxVQUNOLG1CQUFtQjtBQUFBLFVBQ25CLHNCQUFzQjtBQUFBLFVBQ3RCLHFCQUFxQjtBQUFBLFFBQ3ZCO0FBQUEsUUFDQSxvQkFBb0I7QUFBQSxNQUN0QixDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsTUFDUCxjQUFjO0FBQUEsTUFDZCxxQkFBcUI7QUFBQSxNQUNyQixPQUFPLFNBQVMsZ0JBQWdCLG1CQUFtQixFQUFFLE9BQU8sUUFBUSxDQUFDO0FBQUEsSUFDdkU7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQUVELFNBQVMsdUJBQXVCO0FBQzlCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUF1QjtBQUNyQyxhQUFPLFlBQVksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTO0FBQ3pDLGNBQU0sTUFBTSxJQUFJLFFBQVEsWUFBWSxHQUFHLE1BQU0sMEJBQTBCO0FBRXZFLFlBQUksS0FBSztBQUNQLGdCQUFNLFVBQVUsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBRW5DLGNBQUksWUFBWSxLQUFLO0FBQ25CLGdCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsZ0JBQUk7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUVBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFFQSxhQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
