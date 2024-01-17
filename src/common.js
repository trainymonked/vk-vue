export const APP_ID = 51832139
export const VERSION = '5.131'
export const LANGUAGE = 'ru'
export const HIDE_DEACTIVATED = true

export function getAge(bdate) {
    let age
    if (bdate) {
        const [day, month, year] = bdate.split('.')
        if (year) {
            age = Math.floor(
                (Date.now() - new Date(year, month - 1, day).getTime()) / 1000 / 60 / 60 / 24 / 365
            )
        }
    }
    return age
}

export function getFriendColor(friend, maxFriendsCount) {
    if (maxFriendsCount > 1) {
        return `rgba(255, 0, 0, ${(friend.friendsWithOriginalUsers - 1) / maxFriendsCount})`
    }
    return 'rgba(0, 0, 0, 0)'
}

export async function asyncForEach(array, asyncCallback, ms = 350) {
    for (let i = 0; i < array.length; i++) {
        await asyncCallback(array[i], i, array)
        await new Promise((resolve) => setTimeout(resolve, ms))
    }
}
