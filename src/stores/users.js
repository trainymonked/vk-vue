import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsersStore = defineStore('users', () => {
    const originalUsers = ref([])
    const friendsOfUsers = ref([])
    const maxFriendsCount = ref(0)

    function addOriginalUser(user) {
        if (originalUsers.value.findIndex((ou) => ou.id === user.id) === -1) {
            originalUsers.value.push(user)
        }
    }

    function removeOriginalUser(userId) {
        originalUsers.value = originalUsers.value.filter((user) => user.id !== userId)
    }

    return { originalUsers, friendsOfUsers, addOriginalUser, removeOriginalUser, maxFriendsCount }
})
