import { NOTIFICATION_LIMIT } from '../../js/constants'

const initialState = {
    header: undefined,
    msg: 'Some error occured.',
    errorHistory: [],
    unreadCount: 0,
    actionType: 'MSG',
    isFinished: true, 
}

const errorNotifier = (state = initialState, action) => {
    switch (action.type) {
        case 'ERROR_NOTIFIER': {
            return {
                msg: action.msg,
                header: action.header,
                errorHistory: [{
                    time: new Date(),
                    message: action.msg,
                }, ...state.errorHistory].splice(0, NOTIFICATION_LIMIT),
                unreadCount: Math.min(state.unreadCount + 1, NOTIFICATION_LIMIT),
                actionType: 'MSG', isFinished: false
            }
        }

        case 'UPDATE_COUNT': {
            return { ...state, unreadCount: action.count, actionType: 'UPDATE_COUNT'}
        }

        case 'UPDATE_NOTIFICATION': {
            return {
                ...state, unreadCount: action.count,
                errorHistory: action.errors.splice(0, NOTIFICATION_LIMIT),
                actionType: 'UPDATE_NOTIFICATION'
            }
        }
        
        case 'MSG_DISPLAYED':
            return {...state, isFinished: true}

        default: return state;
    }
}


export default errorNotifier