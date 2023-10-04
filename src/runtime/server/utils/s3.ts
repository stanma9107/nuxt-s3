import crypto from 'crypto'
import { AwsClient } from 'aws4fetch'
import { createError } from 'h3'
import { createStorage } from 'unstorage'
import { $fetch } from 'ofetch'
import mime from 'mime'
import { denormalizeKey } from './key'
import { useRuntimeConfig } from '#imports'

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto
}

const config = useRuntimeConfig()

const client = new AwsClient({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
  region: config.s3.region,
  service: 's3'
})

const s3Storage = createStorage({
  // @ts-ignore
  driver: {
    name: 's3',

    async getItemRaw (key, opts) {
      key = denormalizeKey(key)

      const request = await client.sign(
        `${config.s3.endpoint}/${config.s3.bucket}/${key}`,
        {
          method: 'GET'
        }
      )

      const res = await $fetch.raw(request).catch(() => {
        throw createError({
          message: 'get-failed',
          statusCode: 404
        })
      })

      const contentType = res.headers.get('Content-Type')

      opts.mimeType = contentType

      return res._data.stream()
    },

    async setItemRaw (key, value) {
      key = denormalizeKey(key)

      const type = mime.getType(key)

      const request = await client.sign(
        `${config.s3.endpoint}/${config.s3.bucket}/${key}`,
        {
          method: 'PUT',
          body: value,
          headers: {
            'Content-Type': type as string
          }
        }
      )

      return $fetch(request).catch(() => {
        throw createError({
          message: 'put-failed',
          statusCode: 500
        })
      })
    },

    async removeItem (key) {
      key = denormalizeKey(key)

      const request = await client.sign(
        `${config.s3.endpoint}/${config.s3.bucket}/${key}`,
        {
          method: 'DELETE'
        }
      )

      return $fetch(request).catch(() => {
        throw createError({
          message: 'delete-failed',
          statusCode: 400
        })
      })
    }
  }
})

export { s3Storage }
