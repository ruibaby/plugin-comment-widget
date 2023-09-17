<script lang="ts" setup>
import {
  VEmpty,
  VSpace,
  VButton,
  VPagination,
  VLoading,
} from "@halo-dev/components";
import CommentItem from "./CommentItem.vue";
import Form from "./Form.vue";
import { computed, onMounted, provide, ref, type Ref } from "vue";
import type { CommentVoList, User } from "@halo-dev/api-client";
import { apiClient } from "../utils/api-client";
import axios from "axios";
import type { GlobalInfo } from "../types";
import { useLocalStorage } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    kind: string;
    name: string;
    group: string;
    colorScheme?: "system" | "dark" | "light";
    emojiData: () => Promise<any>;
  }>(),
  {
    kind: undefined,
    name: undefined,
    group: undefined,
    colorScheme: "light",
  }
);

provide<string>("kind", props.kind);
provide<string>("name", props.name);
provide<string>("group", props.group);
provide<string>("colorScheme", props.colorScheme);
provide<() => Promise<any>>("emojiData", props.emojiData);

const currentUser = ref<User>();
const comments = ref<CommentVoList>({
  page: 1,
  size: 20,
  total: 0,
  items: [],
  first: true,
  last: false,
  hasNext: false,
  hasPrevious: false,
  totalPages: 0,
});
const loading = ref(false);

provide<Ref<User | undefined>>("currentUser", currentUser);

const handleFetchLoggedUser = async () => {
  try {
    const { data } = await apiClient.user.getCurrentUserDetail();
    currentUser.value =
      data.user.metadata.name === "anonymousUser" ? undefined : data.user;
  } catch (error) {
    console.error("Fetch logined user failed", error);
  }
};

const handleFetchComments = async (mute?: boolean) => {
  try {
    if (!mute) {
      loading.value = true;
    }
    const { data } = await apiClient.comment.listComments1({
      page: comments.value.page,
      size: comments.value.size,
      kind: props.kind,
      name: props.name,
      group: props.group,
      version: "v1alpha1",
    });
    comments.value = data;
  } catch (error) {
    console.error("Failed to fetch comments", error);
  } finally {
    loading.value = false;
  }
};

const handlePaginationChange = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  comments.value.page = page;
  comments.value.size = size;
  handleFetchComments();
};

onMounted(() => {
  handleFetchLoggedUser();
  handleFetchComments();
});

const onCommentCreated = () => {
  handleFetchComments();
};

const getColorScheme = computed(() => {
  if (props.colorScheme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return props.colorScheme;
});

// fetch value of allowAnonymousComments

const allowAnonymousComments = ref<boolean | undefined>(false);

provide<Ref<Boolean | undefined>>(
  "allowAnonymousComments",
  allowAnonymousComments
);

const handleFetchValueOfAllowAnonymousComments = async () => {
  const { data } = await axios.get<GlobalInfo>(`/actuator/globalinfo`, {
    withCredentials: true,
  });
  allowAnonymousComments.value = data.allowAnonymousComments;
};

onMounted(handleFetchValueOfAllowAnonymousComments);

// upvote

const upvotedComments = useLocalStorage<string[]>("halo.upvoted.comments", []);
const upvotedReplies = useLocalStorage<string[]>("halo.upvoted.replies", []);
provide<Ref<string[]>>("upvotedComments", upvotedComments);
provide<Ref<string[]>>("upvotedReplies", upvotedReplies);
</script>
<template>
  <div class="halo-comment-widget" :class="getColorScheme">
    <Form @created="onCommentCreated" />
    <div class="comment-timeline mt-6">
      <div class="flex items-center">
        <div class="flex flex-auto items-center gap-1">
          <span class="text-sm font-medium text-gray-900 dark:text-slate-50">
            {{ comments?.total || 0 }} 条评论
          </span>
          <span v-if="false" class="font-bold">·</span>
          <span v-if="false" class="text-sm text-gray-800">20 条回复</span>
        </div>
        <div></div>
      </div>

      <div
        class="mt-4 flex flex-col divide-y divide-gray-100 dark:divide-slate-700"
      >
        <VLoading v-if="loading" class="dark:text-slate-100" />
        <Transition v-else-if="!comments.items.length" appear name="fade">
          <VEmpty title="暂无评论" message="你可以尝试点击刷新或者添加新评论">
            <template #actions>
              <VSpace>
                <VButton type="default" @click="handleFetchComments">
                  刷新
                </VButton>
              </VSpace>
            </template>
          </VEmpty>
        </Transition>
        <TransitionGroup v-else appear name="fade" tag="div">
          <CommentItem
            v-for="(comment, index) in comments.items"
            :key="index"
            :comment="comment"
            @reload="handleFetchComments(true)"
          ></CommentItem>
        </TransitionGroup>
      </div>
    </div>
    <div
      v-if="comments.hasPrevious || comments.hasNext"
      class="my-4 sm:flex sm:items-center sm:justify-center"
    >
      <VPagination
        :page="comments.page"
        :size="comments.size"
        :total="comments.total"
        :size-options="[20, 30, 50, 100]"
        class="bg-transparent"
        @change="handlePaginationChange"
      />
    </div>
  </div>
</template>
