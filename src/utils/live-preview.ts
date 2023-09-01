import ContentstackLivePreview from "@contentstack/live-preview-utils";

const {
  REACT_APP_CONTENTSTACK_LIVE_PREVIEW,
  REACT_APP_CONTENTSTACK_APP_HOST,
  REACT_APP_CONTENTSTACK_API_KEY,
  REACT_APP_CONTENTSTACK_ENVIRONMENT,
} = process.env;

// Setting LP if enabled
ContentstackLivePreview.init({
  enable: REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true",
  clientUrlParams: {
    host: REACT_APP_CONTENTSTACK_APP_HOST,
  },
  stackDetails: {
    apiKey: REACT_APP_CONTENTSTACK_API_KEY,
    environment: REACT_APP_CONTENTSTACK_ENVIRONMENT,
  },
  ssr: false,
})?.catch((err) => console.error(err));

export const { onEntryChange } = ContentstackLivePreview;
