import ContentstackLivePreview from "@contentstack/live-preview-utils";
import {
  customHostUrl,
  initializeContentStackSdk,
  isValidCustomHostUrl,
} from "./utils";

const {
  REACT_APP_CONTENTSTACK_API_HOST,
  REACT_APP_CONTENTSTACK_APP_HOST,
  REACT_APP_CONTENTSTACK_API_KEY,
  REACT_APP_CONTENTSTACK_ENVIRONMENT,
  REACT_APP_CONTENTSTACK_LIVE_PREVIEW,
} = process.env;
const customHostBaseUrl = customHostUrl(
  REACT_APP_CONTENTSTACK_API_HOST as string
);

// SDK initialization
const Stack = initializeContentStackSdk();

// set host url only for custom host or non prod base url's
if (isValidCustomHostUrl(customHostBaseUrl)) {
  Stack.setHost(customHostBaseUrl);
}

// Setting LP if enabled
ContentstackLivePreview.init({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  stackSdk: Stack,
  clientUrlParams: {
    host: REACT_APP_CONTENTSTACK_APP_HOST,
  },
  stackDetails: {
    apiKey: REACT_APP_CONTENTSTACK_API_KEY,
    environment: REACT_APP_CONTENTSTACK_ENVIRONMENT,
  },
  enable: REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true",
  ssr: false,
})?.catch((err) => console.error(err));

export const { onEntryChange } = ContentstackLivePreview;

export const renderOption = {
  span: (node: any, next: any) => next(node.children),
};
