<script setup>
import Header from '@/components/Header.vue'
import OriginalList from '@/components/OriginalList.vue'
import FriendsList from '@/components/FriendsList.vue'
</script>

<template>
    <Header />
    <div class="flex justify-between gap-2 items-start px-1 mt-2">
        <OriginalList class="w-[25%]" />
        <FriendsList class="w-[75%]" />
    </div>
</template>
