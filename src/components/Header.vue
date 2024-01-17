<script setup>
import { ref } from 'vue'
import _ from 'lodash'

import { VKUsersSearch, VKFriendsGet, VKExecute } from '@/services/VK'
import { useStore } from '@/stores/common'
import { HIDE_DEACTIVATED, asyncForEach } from '@/common'

const search = ref('')
const users = ref([])

const store = useStore()

const searchUsers = _.debounce(async () => {
    if (search.value.trim() === '') {
        users.value = []
    } else {
        store.loading = true
        const { response } = await VKUsersSearch({
            q: search.value,
            count: 5,
            fields: 'photo_50,sex,bdate',
        })
        users.value = response.items
        store.loading = false
    }
}, 500)

function clearSearch() {
    search.value = ''
    users.value = []
}

async function buildFriendsList() {
    store.loading = true
    store.friendsOfUsers = []
    const uniqueUsers = []

    await asyncForEach(store.originalUsers, async (originalUser) => {
        const { response } = await VKFriendsGet({ user_id: originalUser.id, fields: 'photo_50,sex,bdate' })
        if (response.items) {
            originalUser.friends = response.items.map((i) => i.id)
            response.items.forEach((item) => {
                if (!uniqueUsers.some((user) => user.id === item.id)) {
                    uniqueUsers.push(item)
                }
            })
        }
    })

    const friendsOfUsers = uniqueUsers
        .filter((user) => !store.originalUsers.some((ou) => ou.id === user.id))
        .filter((user) => !(user.deactivated && HIDE_DEACTIVATED))
        .map((user) => ({
            ...user,
            friendsWithOriginalUsers: store.originalUsers.filter((ou) => ou.friends?.includes(user.id)).length,
        }))
        .sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name))

    store.maxFriendsCount = Math.max(...friendsOfUsers.map((u) => u.friendsWithOriginalUsers))
    await countAllFriends(friendsOfUsers)
}

async function countAllFriends(friendsOfUsers) {
    const chunks = _.chunk(friendsOfUsers, 25)

    await asyncForEach(chunks, async (chunk) => {
        const ids = chunk.map((user) => user.id).join(', ')
        const { response } = await VKExecute({
            code: `
                var ids = [${ids}];
                var i = 0;
                var result = [];
                while(i < ids.length) {
                    var fr = API.users.get({ "user_ids": ids[i], fields: "counters" })[0].counters.friends;
                    result.push({ id: ids[i], friends: fr });
                    i = i + 1;
                }
                return result;
            `,
        })
        response.forEach(({ id, friends }) => {
            friendsOfUsers = friendsOfUsers.map((user) => (user.id === id ? { ...user, friendsCount: friends } : user))
        })
    })
    store.friendsOfUsers = friendsOfUsers
    store.loading = false
}

function addUser(userId) {
    const { first_name, last_name, photo_50 } = users.value.find((user) => user.id === userId)
    store.addOriginalUser({ id: userId, first_name, last_name, photo_50 })
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
            @click="user.can_access_closed && !store.originalUsers.some((ou) => ou.id === user.id) && addUser(user.id)"
            :class="
                !user.can_access_closed || store.originalUsers.some((ou) => ou.id === user.id)
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
            "
        >
            <img :src="user.photo_50" width="44" height="44" class="rounded-full" />
            {{ user.first_name }} {{ user.last_name }}
        </div>
    </div>
</template>
