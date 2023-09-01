import ContentstackLivePreview from "@contentstack/live-preview-utils";

const { REACT_APP_CONTENTSTACK_LIVE_PREVIEW } = process.env;

// Setting LP if enabled
ContentstackLivePreview.init({
  enable: REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true",
  ssr: false,
})?.catch((err) => console.error(err));

export const { onEntryChange } = ContentstackLivePreview;
