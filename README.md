# Nuxt S3

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

S3 client for Nuxt 3 with REST API thanks to [aws4fetch](https://github.com/mhart/aws4fetch).

## Features

- ✔️ Lightweight, only 12kB in total
- ✔️ Edge compatible
- ✔️ Object `upload` `remove` via `useS3Object` composable

## Quick Setup

1. Add `nuxt-s3` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-s3

# Using yarn
yarn add --dev nuxt-s3

# Using npm
npm install --save-dev nuxt-s3
```

2. Add `nuxt-s3` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ["nuxt-s3"],

  s3: {
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    endpoint: "",
    region: "",
    accept: "", // Regex to validate file type. To accept only images "^image/(png|jpeg|png|gif)"
  },
});
```

That's it! You can now use Nuxt S3 in your Nuxt app ✨

## Authorization

The module presents `s3:auth` hook in order to pass authorization header to mutation APIs (`upload` & `remove`).

```js
export default defineNuxtPlugin({
  hooks: {
    "s3:auth": (headers) => {
      headers.authorization = "bearer ";
    },
  },
});
```

On server side, You can create a middleware and validate authorization on mutation endpoints

```js
export default defineEventHandler((event) => {
  const isS3Mutation = getRequestURL(event).pathname.includes("s3/mutation");

  if (isS3Mutation) {
    // check authorization
  }
});
```

## key naming

On object `upload`, the key is set by default as UUID. In order to organize objects in the bucket, you can assign to it a custom `key` or `prefix` the default with its location, e.g *folder/*. Please refer to [docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html) for guidelines.

## Caching

In order to cache Get object response, You can set caching rule on `/api/s3/query/**` route

```js
  routeRules: {
    "/api/s3/query/**": { isr: true },
  },
```

## Example

```vue
<template>
  <img :src="url" />

  <form @submit.prevent="(e) => handleChange(e.target?.file.files)">
    <input type="file" name="file" />
    <button>Change</button>
  </form>
</template>

<script setup lang="ts">
const { upload } = useS3Object();

const url = ref(
  "https://upload.wikimedia.org/wikipedia/commons/4/45/NuxtJS_Logo.png"
);

async function handleChange(files: File[]) {
  url.value = await upload(files[0], {
    url: url.value,
  });
}
</script>
```

## Known issues

On Netlify, in case of upload fail with `invalid-file` error message, please check this [issue](https://github.com/unjs/nitro/issues/1719).

## License

[MIT License](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-s3/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-s3
[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-s3.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-s3
[license-src]: https://img.shields.io/npm/l/nuxt-s3.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-s3
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
