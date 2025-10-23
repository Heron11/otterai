import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  // Only attempt to boot when the document is cross-origin isolated.
  // Without this, WebContainer.boot() will throw in environments that
  // don’t have proper COOP/COEP headers (e.g., certain routes or previews).
  if ((self as any).crossOriginIsolated) {
    webcontainer =
      import.meta.hot?.data.webcontainer ??
      Promise.resolve()
        .then(() => WebContainer.boot({ workdirName: WORK_DIR_NAME }))
        .then((instance) => {
          webcontainerContext.loaded = true;
          return instance;
        });

    if (import.meta.hot) {
      import.meta.hot.data.webcontainer = webcontainer;
    }
  } else {
    // Provide a non-rejecting placeholder promise to avoid unhandled rejections
    // when modules eagerly await the webcontainer during initialization.
    console.warn('[OtterAI] WebContainer disabled: crossOriginIsolated is false. Skipping boot.');
    webcontainer = new Promise<WebContainer>(() => {});
  }
}
