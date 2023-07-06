import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { updateNotification } from '../redux/actions/errorNotifier';
import emptyImage from '../media/empty-image.png'

const NotificationPanel = forwardRef((props, _ref) => {
    const notificationPanelRef = useRef();
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [isNotificationMounted, setNotificationMounted] = useState(false);
    const notifications = useSelector(state => state.errorNotifier);
    const dispatch = useDispatch();
    const clearRef = useRef(0);

    useEffect(() => {
        if (isNotificationOpen && isNotificationMounted)
            notificationPanelRef.current.focus();

    }, [isNotificationOpen])


    useEffect(() => {
        if (isNotificationMounted)
            setNotificationOpen(true);
    }, [isNotificationMounted])



    useImperativeHandle(_ref, () => ({
        togglePanel() {
            if (isNotificationMounted)
                setNotificationOpen(false);
            else
                setNotificationMounted(true);

        },
    }));

    const handleNotificationBlur = (e) => {
        if (!(e.relatedTarget && e.relatedTarget.className === 'navbar-notification-icon-container'))
            setNotificationOpen(false);
    }

    const closeNotification = (e) => {
        setNotificationOpen(false);
    }

    const unmountNotification = () => {
        setNotificationMounted(isNotificationOpen)
    }

    const clearAllNotification = () => {
        clearRef.current = notifications.unreadCount;
        if (clearRef.current)
            Array.from(notificationPanelRef.current.children[1].children).forEach((msgContainer) => {
                msgContainer.className = 'nav-notif-msg-container hidden'
            })
        else
            setNotificationOpen(false);
    }

    const reduceRefCount = () => {
        clearRef.current -= 1;
        if (clearRef.current === 0) {
            dispatch(updateNotification(0, []))
            setNotificationOpen(false);
        }
    }

    return (
        <>
            {isNotificationMounted && <div className={`navbar-notification-panel${isNotificationOpen ? '' : ' hidden'}`} tabIndex={0}
                onBlur={handleNotificationBlur} ref={notificationPanelRef} onTransitionEnd={unmountNotification} >
                <div className='nav-notif-panel-control-container'>
                    <span className='nav-notif-close' onClick={closeNotification}> Close</span>
                    <span className='nav-notif-clear' onClick={clearAllNotification}>Clear All Notification</span>
                </div>
                {(notifications.errorHistory.length !== 0) ?
                    <div className='navbar-notification-container' >
                        {
                            notifications.errorHistory.map((value, index) => {
                                const timeText = value.time.toLocaleDateString(undefined,
                                    { month: "long", day: "numeric", hour: 'numeric', minute: 'numeric', second: 'numeric' })
                                return (
                                    <div className='nav-notif-msg-container' key={index} onTransitionEnd={reduceRefCount}>
                                        <div className='nav-notif-msg-time'>{timeText}</div>
                                        <div className='nav-notif-msg-text'>{value.message + ""}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    :
                    <div className='nav-notif-empty-container'>
                        <img src={emptyImage} />
                        <div className='navbar-notif-empty-text'>Wow, such empty</div>
                    </div>}

            </div >
            }
        </>
    )

})

export default NotificationPanel