<script setup>
import { ref } from 'vue'
import _ from 'lodash'

import { VKUsersSearch, VKFriendsGet } from '@/services/VK'
import { useStore } from '@/stores/common'
import { HIDE_DEACTIVATED } from '@/common'

const search = ref('')
const users = ref([])

const store = useStore()

const searchUsers = _.debounce(() => {
    if (search.value.trim() === '') {
        users.value = []
    } else {
        store.loading = true
        VKUsersSearch(
            {
                q: search.value,
                count: 5,
                fields: 'photo_50,sex,bdate',
            },
            ({ response }) => {
                users.value = response.items
                store.loading = false
            }
        )
    }
}, 500)

function clearSearch() {
    search.value = ''
    users.value = []
}

function buildFriendsList() {
    store.loading = true
    const uniqueUsers = []
    store.originalUsers.forEach((user, idx) => {
        VKFriendsGet({ user_id: user.id, fields: 'photo_50,sex,bdate' }, ({ response }) => {
            if (response.items) {
                store.originalUsers[idx].friends = response.items.map((i) => i.id)
                response.items.forEach((item) => {
                    if (uniqueUsers.findIndex((user) => user.id === item.id) === -1) {
                        uniqueUsers.push(item)
                    }
                })
            }
            if (idx === store.originalUsers.length - 1) {
                store.friendsOfUsers = uniqueUsers
                    .filter((user) => store.originalUsers.findIndex((ou) => ou.id === user.id) === -1)
                    .filter((user) => !(user.deactivated && HIDE_DEACTIVATED))
                    .map((user) => ({
                        ...user,
                        friendsWithOriginalUsers: store.originalUsers.filter((ou) => ou.friends?.includes(user.id))
                            .length,
                    }))
                    .sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name))
                store.maxFriendsCount = Math.max(...store.friendsOfUsers.map((u) => u.friendsWithOriginalUsers))
                store.loading = false
            }
        })
    })
}

function addUser(userId) {
    const userById = users.value.find((user) => user.id === userId)
    store.addOriginalUser({
        id: userId,
        first_name: userById.first_name,
        last_name: userById.last_name,
        photo_50: userById.photo_50,
    })
}
</script>

<template>
    <div class="flex items-center">
        <div class="w-5/6 px-4 py-2 bg-neutral-600 flex gap-2 rounded-xl">
            <input
                class="w-full bg-neutral-600 text-white outline-none placeholder:text-neutral-200"
                v-model="search"
                @input="searchUsers"
                autofocus
                placeholder="Введите имя, фамилию, id (id1) или имя пользователя (durov)"
            />
            <button class="bg-red-500 px-2.5 my-2 pb-1 rounded-full" @click="clearSearch">х</button>
        </div>
        <div class="w-1/6 text-center">
            <button
                class="px-4 py-2 bg-slate-900 text-slate-50 rounded-xl disabled:bg-slate-400"
                @click="buildFriendsList"
                :class="store.originalUsers.length === 0 ? 'cursor-not-allowed' : 'cursor-pointer'"
                :disabled="store.originalUsers.length === 0"
            >
                Построить
            </button>
        </div>
    </div>
    <div class="flex flex-col w-10/12">
        <div
            v-for="user in users"
            :key="user.id"
            :title="!user.can_access_closed ? 'Это закрытый профиль' : ''"
            class="flex items-center px-4 py-1 gap-2 hover:bg-neutral-200"
            @click="
                user.can_access_closed &&
                    store.originalUsers.findIndex((ou) => ou.id === user.id) === -1 &&
                    addUser(user.id)
            "
            :class="
                !user.can_access_closed || store.originalUsers.findIndex((ou) => ou.id === user.id) !== -1
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
            "
        >
            <img :src="user.photo_50" width="44" height="44" class="rounded-full" />
            {{ user.first_name }} {{ user.last_name }}
        </div>
    </div>
</template>
