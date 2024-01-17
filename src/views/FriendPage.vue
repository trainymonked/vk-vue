<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { VKWallGet, VKUsersGet } from '@/services/VK'
import { useStore } from '@/stores/common'

import WallPost from '@/components/WallPost.vue'

const route = useRoute()

const friendId = +route.params.id
const friend = ref({})
const friends = ref([])
const wallPosts = ref([])
const authors = ref([])

const store = useStore()
const router = useRouter()

onBeforeMount(async () => {
    store.loading = true

    friends.value = store.originalUsers.filter((ou) => ou.friends.includes(friendId))

    const { response } = await VKUsersGet({
        user_ids: friendId,
        fields: 'photo_50',
    })

    friend.value = response[0]

    if (friend.value.can_access_closed) {
        const {
            response: { items, groups, profiles },
        } = await VKWallGet({
            owner_id: friendId,
            extended: 1,
        })
        if (friend.value.can_access_closed) {
            wallPosts.value = items.map((p) => ({
                ...p,
                isRepost: !!p.copy_history,
            }))
            authors.value = groups
                .map((g) => ({ id: g.id, name: g.name, photo_50: g.photo_50 }))
                .concat(
                    profiles.map((p) => ({
                        id: p.id,
                        name: `${p.first_name} ${p.last_name}`,
                        photo_50: p.photo_50,
                    }))
                )
        }
    }
    store.loading = false
})
</script>

<template>
    <div class="flex justify-between">
        <div class="w-[10%] flex px-2">
            <button class="flex items-center gap-4 px-4 rounded-md hover:bg-slate-300" @click="router.go(-1)">
                <div class="h-0 w-0 border-x-8 border-x-transparent border-b-[20px] border-b-black -rotate-90"></div>
                Назад
            </button>
        </div>
        <div class="flex items-center gap-2">
            <img :src="friend.photo_50" width="50" height="50" class="rounded-full" />
            <p>{{ friend.first_name }} {{ friend.last_name }}</p>
        </div>
        <div class="w-[10%]"></div>
    </div>
    <div class="flex justify-between gap-2 items-start px-1 mt-2">
        <div class="w-[33%] bg-neutral-300 rounded-3xl px-4 py-2 flex flex-col">
            <p class="text-center font-bold">Друзья из списка Исходный</p>
            <div class="flex flex-col gap-2">
                <div v-for="f in friends" :key="f.id" class="flex items-center gap-2">
                    <img :src="f.photo_50" width="44" height="44" class="rounded-full" />
                    <p :title="`${f.first_name} ${f.last_name}`">{{ f.first_name }} {{ f.last_name }}</p>
                </div>
            </div>
            <div v-if="friends.length === 0" class="text-center py-2">Список пользователей пуст</div>
        </div>
        <div class="w-[66%] bg-neutral-300 rounded-3xl px-4 py-2 flex flex-col gap-2">
            <p class="text-center font-bold">Записи на стене</p>
            <WallPost
                v-for="post in wallPosts"
                :key="post.id"
                :post="post"
                :author="
                    post.copy_history
                        ? post.copy_history[0].from_id > 0
                            ? authors.find((a) => a.id === post.copy_history[0].from_id)
                            : authors.find((a) => a.id === -post.copy_history[0].from_id)
                        : authors.find((a) => a.id === post.from_id)
                "
            />
            <div v-if="!friend.can_access_closed" class="text-center py-2">Это закрытый профиль</div>
            <div v-if="friend.can_access_closed && wallPosts.length === 0" class="text-center py-2">Записей нет</div>
        </div>
    </div>
</template>
