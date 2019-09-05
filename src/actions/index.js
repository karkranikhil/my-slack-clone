import * as actionsTypes from './types'
export const setUser =user=>{
    return {
        type:actionsTypes.SET_USER,
        payload:{
            currentUser:user
        }
    }
}
export const clearUser =()=>{
    return {
        type:actionsTypes.CLEAR_USER
    }
}
export const setCurrentChannel =channel=>{
    return {
        type:actionsTypes.SET_CURRENT_CHANNEL,
        payload:{
            currentChannel:channel
        }
    }
}

export const setPrivateChannel = isPrivateChannel=>{
    return {
        type:actionsTypes.SET_PRIVATE_CHANNEL,
        payload:{
            isPrivateChannel
        }
    }
}
export const setUserPosts = userPosts=>{
    return {
        type:actionsTypes.SET_USER_POSTS,
        payload:{
            userPosts
        }
    }
}


