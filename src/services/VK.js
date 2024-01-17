import { useStore } from '@/stores/common'
import { APP_ID, LANGUAGE, VERSION } from '@/common'

export function VKInit() {
    const store = useStore()

    VK.init({
        apiId: APP_ID,
    })
    VK.Auth.getLoginStatus(({ status }) => {
        if (status !== 'connected') {
            store.loading = true
            VK.Auth.login((r) => {
                if (r.status === 'connected') {
                    store.loading = false
                }
            })
        }
    })
}

export function VKUsersSearch(options) {
    return new Promise((resolve) => {
        VK.Api.call(
            'users.search',
            {
                ...options,
                v: VERSION,
                language: LANGUAGE,
            },
            (response) => resolve(response)
        )
    })
}

export function VKFriendsGet(options) {
    return new Promise((resolve) => {
        VK.Api.call(
            'friends.get',
            {
                ...options,
                v: VERSION,
                language: LANGUAGE,
            },
            (response) => resolve(response)
        )
    })
}

export function VKUsersGet(options) {
    return new Promise((resolve) => {
        VK.Api.call(
            'users.get',
            {
                ...options,
                v: VERSION,
                language: LANGUAGE,
            },
            (response) => resolve(response)
        )
    })
}

export function VKWallGet(options) {
    return new Promise((resolve) => {
        VK.Api.call(
            'wall.get',
            {
                ...options,
                v: VERSION,
                language: LANGUAGE,
            },
            (response) => resolve(response)
        )
    })
}

export function VKExecute(data) {
    return new Promise((resolve) => {
        VK.Api.call(
            'execute',
            {
                ...data,
                v: VERSION,
            },
            (response) => resolve(response)
        )
    })
}
