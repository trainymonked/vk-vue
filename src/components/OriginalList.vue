<script setup>
import { useStore } from '@/stores/common'

const store = useStore()
</script>

<template>
    <div class="bg-neutral-300 rounded-3xl px-4 py-2 flex flex-col">
        <p class="text-center font-bold">Исходный</p>
        <div class="flex flex-col gap-2">
            <div v-for="user in store.originalUsers" :key="user.id" class="flex justify-between gap-2">
                <div class="flex items-center gap-2">
                    <img :src="user.photo_50" width="44" height="44" class="rounded-full" />
                    <p :title="`${user.first_name} ${user.last_name}`">{{ user.first_name }} {{ user.last_name }}</p>
                </div>
                <button class="bg-red-500 px-2.5 my-2 pb-1 rounded-full" @click="store.removeOriginalUser(user.id)">
                    х
                </button>
            </div>
        </div>
        <div v-if="store.originalUsers.length === 0" class="text-center py-2">Список пользователей пуст</div>
    </div>
</template>
