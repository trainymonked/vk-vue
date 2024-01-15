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

export function VKUsersSearch(options, callback) {
    VK.Api.call(
        'users.search',
        {
            ...options,
            v: VERSION,
            language: LANGUAGE,
        },
        callback
    )
}

export function VKFriendsGet(options, callback) {
    VK.Api.call(
        'friends.get',
        {
            ...options,
            v: VERSION,
            language: LANGUAGE,
        },
        callback
    )
}

export function VKUsersGet(options, callback) {
    VK.Api.call(
        'users.get',
        {
            ...options,
            v: VERSION,
            language: LANGUAGE,
        },
        callback
    )
}

export function VKWallGet(options, callback) {
    VK.Api.call(
        'wall.get',
        {
            ...options,
            v: VERSION,
            language: LANGUAGE,
        },
        callback
    )
}
