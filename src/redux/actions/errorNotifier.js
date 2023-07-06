export const notifyError = (msg, header='Alert') => {
    return {
        type: 'ERROR_NOTIFIER',
        msg: msg,
        header: header
    }
}

export const updateUnreadCount = (value) =>{
    return {type: 'UPDATE_COUNT', count: value}
}

export const updateNotification = (value, errors) =>{
    return({
        type: 'UPDATE_NOTIFICATION',
        count: value,
        errors: errors,
    })
}

export const messageDisplayed = () =>{
    return({
        type: 'MSG_DISPLAYED',
    })
}