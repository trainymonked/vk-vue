<script setup>
const friends = []
const wallPosts = []

/// @@@ created
// function created() {
// Здесь вызываются функции для получения друзей и записей на стене друга
// }
</script>

<template>
    <div>
        <div v-for="friend in friends" :key="friend.id">{{ friend.first_name }} {{ friend.last_name }}</div>
        <div v-for="post in wallPosts" :key="post.id">
            {{ post.text }}
        </div>
    </div>
    <button @click="$router.go(-1)">Назад</button>
</template>
