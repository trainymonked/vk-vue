<script setup>
import { useStore } from '@/stores/common'

import FriendsItem from '@/components/FriendsItem.vue'

const store = useStore()
</script>

<template>
    <div class="bg-neutral-300 rounded-3xl px-4 py-2">
        <p class="text-center font-bold">Друзья</p>
        <div v-if="store.friendsOfUsers.length === 0" class="text-center py-2">
            Список пользователей пуст
        </div>
        <div v-else-if="!store.loading">
            <div
                class="grid px-1 border-neutral-500 border-b items-center text-center"
                style="grid-template-columns: 7% 35% 12% 15% 15% 15%"
            >
                <div class="col-start-2 text-left">Имя и фамилия</div>
                <div class="text-left">Пол</div>
                <div>Возраст</div>
                <div>Кол-во друзей</div>
                <div>Страница</div>
            </div>
            <FriendsItem v-for="friend in store.friendsOfUsers" :key="friend.id" :friend="friend" />
        </div>
    </div>
</template>
