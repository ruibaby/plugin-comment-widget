<script lang="ts" setup>
// @ts-ignore
import { Comment } from "@halo-dev/comment-widget";
import "@halo-dev/comment-widget/dist/style.css";
import { useLocalStorage } from "@vueuse/core";

const group = useLocalStorage("group", "");
const kind = useLocalStorage("kind", "");
const name = useLocalStorage("name", "");
</script>

<template>
  <div style="padding: 10px">
    <div class="mb-2 grid grid-cols-3 gap-2 rounded border p-1">
      <input
        v-model="group"
        placeholder="group"
        class="h-9 rounded border px-2 py-0.5 outline-none"
      />
      <input
        v-model="kind"
        placeholder="kind"
        class="h-9 rounded border px-2 py-0.5 outline-none"
      />
      <input
        v-model="name"
        placeholder="name"
        class="h-9 rounded border px-2 py-0.5 outline-none"
      />
    </div>

    <Comment
      :kind="kind"
      :name="name"
      :group="group"
      color-scheme="dark"
    ></Comment>
  </div>
</template>
