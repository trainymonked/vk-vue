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
                (new Date().getTime() - new Date(year, month - 1, day).getTime()) / 1000 / 60 / 60 / 24 / 365
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
