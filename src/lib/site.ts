/* Both sites ship as one deployment: the v2 build serves this app under /plain/
   (see `build:plain` in package.json and v2/vercel.json). The "new site" is
   therefore just the root of the same origin. */
export const NEW_SITE_URL = '/';
