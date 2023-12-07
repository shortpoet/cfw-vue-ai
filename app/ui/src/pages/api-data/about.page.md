---
title: About
---

<div class="text-center">
  <!-- You can use Vue components inside markdown -->
  <div i-carbon-dicom-overlay class="text-4xl -mb-6 m-auto" />
  <h3>About</h3>
</div>

<div class="text-center m-auto w-md">
  
[api-data](http://localhost:3000/api-data) is an entry point into the [/api](http://localhost:3000/api/health_check) routes. With **file-based routing**, **markdown support**, I18n, and **UnoCSS** for styling and icons.
</div>

## Fetching Data

- [useFetch](https://github.com/shortpoet/cloudflare-workers-vue/tree/main/app/src/composables/fetch.ts) - Fetch data from the server

```js
// syntax highlighting example
import { useFetch } from '@/composables/fetch'
```

## TODO

- [x] Add a [Cloudflare Worker](https://workers.cloudflare.com/) to serve the site
- [x] Make the site [SSR](https://vitejs.dev/guide/ssr.html) compatible
- [ ] Make the urls in markdown pages dynamic
- [ ] Add healthcheck data to MSW

Check out the [GitHub repo](https://github.com/shortpoet/cloudflare-workers-vue) for more details.
