import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('users', () => {
    const originalUsers = ref([])
    const friendsOfUsers = ref([])
    const maxFriendsCount = ref(0)
    const loading = ref(false)

    function addOriginalUser(user) {
        if (!originalUsers.value.some((ou) => ou.id === user.id)) {
            originalUsers.value.push(user)
        }
    }

    function removeOriginalUser(userId) {
        originalUsers.value = originalUsers.value.filter((user) => user.id !== userId)
    }

    return { originalUsers, friendsOfUsers, addOriginalUser, removeOriginalUser, maxFriendsCount, loading }
})
