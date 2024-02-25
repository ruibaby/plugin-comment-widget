<script lang="ts" setup>
import { VButton, VAvatar, VLoading } from "@halo-dev/components";
import MdiStickerEmoji from "~icons/mdi/sticker-emoji";
import MdiSendCircleOutline from "~icons/mdi/send-circle-outline";
import type {
  CommentRequest,
  CommentVo,
  ReplyRequest,
  ReplyVo,
  User,
} from "@halo-dev/api-client";
// @ts-ignore
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { inject, ref, type Ref } from "vue";
import { apiClient } from "@/utils/api-client";
import { useLocalStorage } from "@vueuse/core";
import axios from "axios";
import { onClickOutside } from "@vueuse/core";
import autosize from "autosize";
import { isMac } from "@/utils/device";

interface CustomAccount {
  displayName: string;
  email: string;
  website?: string;
}

const props = withDefaults(
  defineProps<{
    comment?: CommentVo;
    reply?: ReplyVo;
  }>(),
  {
    comment: undefined,
    reply: undefined,
  }
);

const emit = defineEmits<{
  (event: "created"): void;
}>();

const currentUser = inject<Ref<User | undefined>>("currentUser");
const kind = inject<string>("kind");
const name = inject<string>("name");
const group = inject<string>("group");
const emojiData = inject<() => Promise<any>>("emojiData", () =>
  Promise.resolve()
);
const allowAnonymousComments = inject<Ref<boolean | undefined>>(
  "allowAnonymousComments"
);

const raw = ref("");
const allowNotification = ref(true);
const saving = ref(false);

const vAutosize = {
  mounted: (el: HTMLElement) => {
    autosize(el);
  },
};

const customAccount = useLocalStorage<CustomAccount>(
  "halo-comment-custom-account",
  {
    displayName: "",
    email: "",
    website: "",
  }
);

const handleSubmit = async () => {
  if (!props.comment) {
    handleCreateComment();
    return;
  }
  handleCreateReply();
};

const handleCreateComment = async () => {
  if (!kind || !name) {
    console.error("Please provide kind and name");
    return;
  }
  try {
    saving.value = true;

    const commentRequest: CommentRequest = {
      raw: raw.value,
      content: raw.value,
      allowNotification: allowNotification.value,
      subjectRef: {
        group: group,
        kind,
        name,
        version: "v1alpha1",
      },
    };

    const { displayName, email, website } = customAccount.value;

    if (!currentUser?.value && !allowAnonymousComments?.value) {
      alert("请先登录");
      return;
    }

    if (!currentUser?.value && allowAnonymousComments?.value) {
      if (!displayName || !email) {
        alert("请先登录或者完善信息");
        return;
      } else {
        commentRequest.owner = {
          displayName: displayName,
          email: email,
          website: website,
        };
      }
    }

    await apiClient.comment.createComment1({
      commentRequest,
    });
    raw.value = "";

    emit("created");
  } catch (error) {
    console.error("Failed to create comment", error);
  } finally {
    saving.value = false;
  }
};

const handleCreateReply = async () => {
  if (!kind || !name) {
    console.error("Please provide kind and name");
    return;
  }

  try {
    saving.value = true;

    const replyRequest: ReplyRequest = {
      raw: raw.value,
      content: raw.value,
      allowNotification: allowNotification.value,
    };

    if (props.reply) {
      replyRequest.quoteReply = props.reply.metadata.name;
    }

    const { displayName, email, website } = customAccount.value;

    if (!currentUser?.value && !allowAnonymousComments?.value) {
      alert("请先登录");
      return;
    }

    if (!currentUser?.value && allowAnonymousComments?.value) {
      if (!displayName || !email) {
        alert("请先登录或者完善信息");
        return;
      } else {
        replyRequest.owner = {
          displayName: displayName,
          email: email,
          website: website,
        };
      }
    }

    await apiClient.comment.createReply1({
      name: props.comment?.metadata.name as string,
      replyRequest,
    });
    raw.value = "";

    emit("created");
  } catch (error) {
    console.error("Failed to create comment reply", error);
  } finally {
    saving.value = false;
  }
};

const handleLogout = async () => {
  if (window.confirm("确定要退出登录吗？")) {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`, undefined, {
        withCredentials: true,
      });

      window.location.reload();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  }
};

// Emoji picker
const contentInputRef = ref();
const emojiPickerVisible = ref(false);
const emojiPickerRef = ref(null);
const emojiIndex = ref();
const emojiLoading = ref(false);

async function handleOpenEmojiPicker() {
  if (emojiPickerVisible.value) {
    emojiPickerVisible.value = false;
    return;
  }

  if (emojiIndex.value) {
    emojiPickerVisible.value = true;
    return;
  }

  emojiLoading.value = true;
  const data = await emojiData();

  if (!data) {
    alert("加载 Emoji 数据失败");
    emojiLoading.value = false;
  }

  emojiIndex.value = new EmojiIndex(data);
  emojiLoading.value = false;

  emojiPickerVisible.value = true;
}

function onEmojiSelect(emoji: { native: string }) {
  raw.value += emoji.native;
  contentInputRef.value.focus();
}

onClickOutside(emojiPickerRef, () => {
  emojiPickerVisible.value = false;
});

// KeyBoard shortcuts
function onKeydown(e: KeyboardEvent) {
  if (!raw.value) {
    return;
  }

  const isEnter = e.key === "Enter";
  const isShortcut = isMac ? e.metaKey : e.ctrlKey;
  if (isShortcut && isEnter) {
    handleSubmit();
    e.preventDefault();
  }
}

// login
const parentDomId = `#comment-${[group?.replaceAll(".", "-"), kind, name]
  .join("-")
  .replaceAll(/-+/g, "-")}`;

const loginUrl = `/console/login?redirect_uri=${encodeURIComponent(
  window.location.href + parentDomId
)}`;

function handleOpenLoginPage() {
  window.location.href = loginUrl;
}
</script>

<template>
  <div class="comment-form flex gap-4" @keydown="onKeydown">
    <div class="flex flex-1 flex-col gap-y-4">
      <textarea
        ref="contentInputRef"
        v-model="raw"
        v-autosize
        required
        rows="4"
        class="rounded-base block w-full resize-y appearance-none bg-white px-3 py-2 text-sm text-black antialiased outline-0 ring-1 ring-gray-300 dark:bg-slate-700 dark:text-slate-50 dark:ring-slate-600"
        placeholder="编写评论"
      ></textarea>

      <div
        v-if="!currentUser && allowAnonymousComments"
        class="grid grid-cols-1 items-center gap-2 sm:grid-cols-4"
      >
        <input
          v-model="customAccount.displayName"
          class="rounded-base h-9 px-2 py-0.5 text-sm outline-none ring-1 ring-gray-300 dark:bg-slate-700 dark:text-slate-50 dark:ring-slate-600"
          type="text"
          placeholder="昵称"
        />
        <input
          v-model="customAccount.email"
          class="rounded-base h-9 px-2 py-0.5 text-sm outline-none ring-1 ring-gray-300 dark:bg-slate-700 dark:text-slate-50 dark:ring-slate-600"
          type="email"
          placeholder="电子邮件"
        />
        <input
          v-model="customAccount.website"
          class="rounded-base h-9 px-2 py-0.5 text-sm outline-none ring-1 ring-gray-300 dark:bg-slate-700 dark:text-slate-50 dark:ring-slate-600"
          type="url"
          placeholder="网站"
        />

        <a
          class="select-none text-xs text-gray-600 transition-all hover:text-gray-900 dark:text-slate-200 dark:hover:text-slate-400"
          rel="nofollow"
          :href="loginUrl"
        >
          （已有该站点的账号）
        </a>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <template v-if="currentUser">
            <VAvatar
              :src="currentUser.spec.avatar"
              :alt="currentUser.spec.displayName"
              size="sm"
              circle
            />
            <span class="text-sm font-medium dark:text-slate-50">
              {{ currentUser.spec.displayName }}
            </span>
            <VButton size="sm" @click="handleLogout">注销</VButton>
          </template>
          <template v-if="!currentUser && !allowAnonymousComments">
            <VButton size="sm" @click="handleOpenLoginPage">登录</VButton>
          </template>
        </div>
        <div class="flex flex-row items-center gap-3">
          <div ref="emojiPickerRef" class="relative">
            <VLoading v-if="emojiLoading" class="!p-0" />
            <MdiStickerEmoji
              v-else
              class="h-5 w-5 cursor-pointer text-gray-500 transition-all hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-50"
              @click="handleOpenEmojiPicker"
            />
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div
                v-show="emojiPickerVisible"
                class="absolute right-0 z-10 mt-3 transform px-4 sm:px-0"
              >
                <Picker
                  v-if="emojiIndex"
                  :data="emojiIndex"
                  :native="true"
                  @select="onEmojiSelect"
                />
              </div>
            </transition>
          </div>
          <VButton
            :disabled="!raw"
            type="secondary"
            :loading="saving"
            @click="handleSubmit"
          >
            <template #icon>
              <MdiSendCircleOutline class="h-full w-full" />
            </template>
            提交评论
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>
