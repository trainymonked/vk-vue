<script setup>
import { useRouter } from 'vue-router'

import { VKUsersGet } from '@/services/VK'
import { useStore } from '@/stores/common'
import { getFriendColor, getAge } from '@/common'

const props = defineProps({
    friend: Object,
})

const store = useStore()
const router = useRouter()

function getFriendsCount(event, friend) {
    if (friend.friendsCount === undefined) {
        event.stopPropagation()
        store.loading = true
        VKUsersGet({ user_ids: friend.id, fields: 'counters' }, ({ response }) => {
            friend.friendsCount = response[0]?.counters?.friends ?? -1
            store.loading = false
        })
    }
}
</script>

<template>
    <div
        class="grid items-center my-0.5 p-1 rounded-lg cursor-pointer"
        style="grid-template-columns: 7% 35% 12% 15% 15% 15%"
        :style="{ backgroundColor: getFriendColor(friend, store.maxFriendsCount) }"
        @click="router.push(`/friend${friend.id}`)"
    >
        <img class="rounded-full" :src="friend.photo_50" width="40" height="40" />
        <div>{{ friend.first_name }} {{ friend.last_name }}</div>
        <div>{{ friend.sex == '1' ? 'Женский' : 'Мужской' }}</div>
        <div class="text-center">{{ getAge(friend.bdate) || 'Cкрыто' }}</div>
        <button
            class="mx-auto w-fit px-4 py-1 rounded-md"
            :class="friend.friendsCount === undefined ? 'bg-neutral-200' : 'bg-transparent'"
            @click="(e) => getFriendsCount(e, friend)"
        >
            {{ (friend.friendsCount === -1 ? 'Скрыто' : friend.friendsCount) ?? 'показать' }}
        </button>
        <div
            class="mx-auto h-0 w-0 border-x-8 border-x-transparent border-b-[20px] border-b-black rotate-90 hover:duration-100 hover:scale-150"
        ></div>
    </div>
</template>
