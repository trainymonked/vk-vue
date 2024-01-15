<script setup>
import Attachments from './Attachments.vue'

const props = defineProps({
    post: Object,
    author: Object,
})

const { post, author } = props
</script>

<template>
    <div class="bg-white px-5 py-4 rounded-xl flex flex-col gap-1">
        <div class="flex items-center gap-2">
            <svg v-if="post.isRepost" fill="#000000" width="24px" height="24px" viewBox="0 0 24 24">
                <path
                    d="M19 7a1 1 0 0 0-1-1h-8v2h7v5h-3l3.969 5L22 13h-3V7zM5 17a1 1 0 0 0 1 1h8v-2H7v-5h3L6 6l-4 5h3v6z"
                />
            </svg>
            <img class="rounded-full" :src="author.photo_50" width="50" height="50" />
            <div>
                <div class="font-semibold text-sm flex">
                    {{ author.name }}
                    <div v-if="post.final_post" class="font-thin">&nbsp;удалил страницу</div>
                </div>
                <div class="text-xs">{{ new Date(post.date * 1000).toLocaleDateString('ru') }}</div>
            </div>
        </div>
        <div class="test-xs">{{ post.text }}</div>
        <div>
            <Attachments :data="post.attachments" />
        </div>
        <div v-if="post.isRepost">
            <div class="text-sm">{{ post.copy_history[0].text }}</div>
            <div>
                <Attachments :data="post.copy_history[0].attachments" />
            </div>
        </div>
    </div>
</template>
