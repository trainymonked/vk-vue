<script setup>
import { onBeforeMount, ref, watch } from 'vue'
import _ from 'lodash'

import { useUsersStore } from '@/stores/users'

const HIDE_DEACTIVATED = true
const APP_ID = 51828546
const VERSION = '5.131'
const search = ref('')
const users = ref([])

const store = useUsersStore()

onBeforeMount(() => {
    VK.init({
        apiId: APP_ID,
    })
})

const searchUsers = _.debounce(() => {
    if (search.value.trim() === '') {
        users.value = []
    } else {
        VK.Api.call(
            'users.search',
            {
                q: search.value,
                count: 5,
                fields: 'photo_50,sex,bdate',
                v: VERSION,
                language: 'ru',
            },
            ({ response: { items } }) => {
                users.value = items
            }
        )
    }
}, 500)

function getAge(bdate) {
    let age
    if (bdate) {
        const [day, month, year] = bdate.split('.')
        if (year) {
            age = Math.floor(
                (new Date().getTime() - new Date(year, month - 1, day).getTime()) / 1000 / 60 / 60 / 24 / 365
            )
        }
    }
    return age
}

function addUser(userId) {
    const userById = users.value.find((user) => user.id === userId)
    const user = {
        id: userId,
        first_name: userById.first_name,
        last_name: userById.last_name,
        photo_50: userById.photo_50,
        sex: userById.sex,
        age: getAge(userById.bdate),
    }
    store.addOriginalUser(user)
}

function removeUser(userId) {
    store.removeOriginalUser(userId)
}

function friendColor(friend) {
    return `rgba(255, 0, 0, ${friend.friendsWithOriginalUsers / store.maxFriendsCount})`
}

function buildFriendsList() {
    console.log('loading start...')
    const uniqueUsers = []
    store.originalUsers.forEach((user, idx) => {
        VK.Api.call(
            'friends.get',
            {
                user_id: user.id,
                fields: 'photo_50,sex,bdate',
                v: VERSION,
                language: 'ru',
            },
            ({ response: { items } }) => {
                if (items) {
                    store.originalUsers[idx].friends = items.map((i) => i.id)

                    items.forEach((item) => {
                        if (uniqueUsers.findIndex((user) => user.id === item.id) === -1) {
                            uniqueUsers.push(item)
                        }
                    })
                }
                if (idx === store.originalUsers.length - 1) {
                    console.log('loading end...')

                    store.friendsOfUsers = uniqueUsers
                        .filter((user) => store.originalUsers.findIndex((ou) => ou.id === user.id) === -1)
                        .filter((user) => !(user.deactivated && HIDE_DEACTIVATED))
                        .map((user) => ({
                            ...user,
                            friendsWithOriginalUsers: store.originalUsers.filter((ou) => ou.friends.includes(user.id))
                                .length,
                        }))
                        .sort(
                            (a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
                        )
                    store.maxFriendsCount = Math.max(...store.friendsOfUsers.map((u) => u.friendsWithOriginalUsers))
                }
            }
        )
    })
}

function getFriendsCount(event, id) {
    VK.Api.call(
        'users.get',
        {
            user_ids: id,
            fields: 'counters',
            v: VERSION,
            language: 'ru',
        },
        ({ response }) => {
            console.log(response)
            event.target.innerHTML = response[0].counters.friends
            event.target.disabled = true
        }
    )
}

function clearSearch() {
    search.value = ''
    users.value = []
}
</script>

<template>
    <div class="mx-auto max-w-6xl">
        <div class="flex items-center">
            <div class="py-2 px-4 bg-neutral-600 flex gap-2 w-10/12 rounded-xl">
                <input
                    class="w-full bg-neutral-600 text-white outline-none placeholder:text-neutral-200"
                    v-model="search"
                    @input="searchUsers"
                    placeholder="Введите имя, фамилию, id (id1) или имя пользователя (durov)"
                />
                <button class="bg-red-500 px-2.5 my-2 pb-1 rounded-full" @click="clearSearch">х</button>
            </div>
            <div class="w-1/6 text-center">
                <button
                    class="px-4 py-2 bg-slate-900 text-slate-50 rounded-xl cursor-pointer"
                    @click="buildFriendsList"
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
                class="flex items-center px-4 py-1 gap-2 cursor-pointer hover:bg-neutral-200"
                @click="
                    user.can_access_closed &&
                        store.originalUsers.findIndex((ou) => ou.id === user.id) === -1 &&
                        addUser(user.id)
                "
                :class="{
                    'cursor-not-allowed':
                        !user.can_access_closed || store.originalUsers.findIndex((ou) => ou.id === user.id) !== -1,
                }"
            >
                <img :src="user.photo_50" width="44" height="44" class="rounded-full" />
                {{ user.first_name }} {{ user.last_name }}
            </div>
        </div>
        <div>
            <div class="flex justify-between gap-2 px-1 mt-2">
                <div class="w-[25%] bg-neutral-300 rounded-3xl px-4 py-2 flex flex-col">
                    <p class="text-center font-bold">Исходный</p>
                    <div class="flex flex-col gap-2">
                        <div v-for="user in store.originalUsers" :key="user.id" class="flex justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <img :src="user.photo_50" width="44" height="44" class="rounded-full" />
                                <p :title="`${user.first_name} ${user.last_name}`">
                                    {{ user.first_name }} {{ user.last_name }}
                                </p>
                            </div>
                            <button class="bg-red-500 px-2.5 my-2 pb-1 rounded-full" @click="removeUser(user.id)">
                                х
                            </button>
                        </div>
                    </div>
                    <div v-if="store.originalUsers.length === 0" class="text-center py-2">
                        Список пользователей пуст
                    </div>
                </div>
                <div class="w-[75%] bg-neutral-300 rounded-3xl px-4 py-2" v-if="store.friendsOfUsers.length">
                    <div class="grid px-1" style="grid-template-columns: 10% 30% 15% 20% 20%">
                        <div></div>
                        <div>Имя и фамилия</div>
                        <div>Пол</div>
                        <div>Возраст</div>
                        <div>Количество друзей</div>
                    </div>
                    <div
                        class="grid items-center my-0.5 p-1 rounded-lg"
                        style="grid-template-columns: 10% 30% 15% 20% 20%"
                        v-for="friend in store.friendsOfUsers"
                        :key="friend.id"
                        :style="{ backgroundColor: friendColor(friend) }"
                    >
                        <img class="rounded-full" :src="friend.photo_50" width="40" height="40" />
                        <div>{{ friend.first_name }} {{ friend.last_name }}</div>
                        <div>{{ friend.sex == '1' ? 'Женский' : 'Мужской' }}</div>
                        <div>{{ getAge(friend.bdate) || 'Возраст скрыт' }}</div>
                        <button @click="(e) => getFriendsCount(e, friend.id)">показать</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
