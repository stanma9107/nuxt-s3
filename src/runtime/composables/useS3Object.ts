import { v4 as uuidv4 } from "uuid";
import { useNuxtApp } from "#imports";

export default function () {
  const { callHook } = useNuxtApp();
  const headers = {
    authorization: "",
  };

  async function create(file: File, key?: string): Promise<string> {
    key ||= uuidv4();

    const formData = new FormData();
    formData.append("file", file);

    await callHook("s3:auth", headers);

    await $fetch(`/api/s3/mutation/${key}`, {
      method: "POST",
      body: formData,
      headers,
    });

    return getURL(key);
  }

  async function update(
    url: string,
    file: File,
    newKey?: string
  ): Promise<string> {
    newKey ||= uuidv4();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", newKey);

    const key = getKey(url);

    await callHook("s3:auth", headers);

    await $fetch(`/api/s3/mutation/${key}`, {
      method: "PUT",
      body: formData,
      headers,
    });

    return getURL(newKey);
  }

  /**
   * Remove file from its URL
   */
  async function remove(url: string) {
    const key = getKey(url);

    await callHook("s3:auth", headers);

    await $fetch(`/api/s3/mutation/${key}`, {
      method: "DELETE",
      headers,
    });
  }

  /**
   * Upload single file
   * If url is provided and correspond to a previously uploaded object, this object will be replaced.
   * @returns URL of the uploaded file
   */
  async function upload(file: File, opts?: { url?: string; key?: string }) {
    if (opts?.url) {
      if (isValidURL(opts.url)) {
        return update(opts.url, file, opts.key);
      }
    }

    return create(file, opts?.key);
  }

  /**
   * Get URL from key
   */
  function getURL(key: string) {
    return `/api/s3/query/${key}`;
  }

  /**
   * Get Key from URL
   */
  function getKey(url: string) {
    return url.split("/api/s3/query/")[1];
  }

  function isValidURL(url: string) {
    const key = getKey(url) || "";

    return key.length > 0;
  }

  return { upload, remove, getURL, getKey };
}
