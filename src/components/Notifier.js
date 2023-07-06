import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { messageDisplayed } from '../redux/actions/errorNotifier';

const useTimeout = () => {
    const timeout = useRef();
    useEffect(
        () => () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
                timeout.current = null;
            }
        },
        [],
    );
    return timeout;
};

const Notifier = () => {
    const timeout = useTimeout();
    let notifierClassName = 'alert-notifier';
    const alertMessage = useSelector(state => state.errorNotifier);
    const [notifierClass, changeNotifierClass] = useState(notifierClassName);
    // const [alertloaded, setAlertLoaded] = useState(false);
    const dispatch = useDispatch();
    const messageType = (alertMessage.header === 'Success' || alertMessage.header === 'Updated' ? 'SUCCESS' :
        (alertMessage.header === 'Warning') ? 'WARNING' : 'ERROR'
    )

    const icon = (messageType === 'WARNING' || messageType === 'ERROR') ? `\uf071` : `\uf058`
    const iconColor = (messageType === 'ERROR') ? '253, 65, 60' : (messageType == 'WARNING') ? '250, 220, 50' : '4, 170, 109'

    useEffect(() => {
        // If the update is due to user reading message from notification panel
        if (alertMessage.actionType === 'MSG' && (!alertMessage.isFinished)) {
            displayNewMessage();
        }
    }, [alertMessage])

    useEffect(() => {
        if (alertMessage.actionType === 'MSG' && (!alertMessage.isFinished)) {
            displayNewMessage();
        }
    }, [])

    const displayNewMessage = () => {
        triggerAlert();

        //  else {
        //     setAlertLoaded(true);
        // }
    }

    const closeAlert = () => {
        if (timeout.current != null) {
            clearTimeout(timeout.current);
            changeNotifierClass(`${notifierClassName} fade-out`);
            timeout.current = null;
        }
    }

    const setAlertTimeOut = (time) => {
        timeout.current = setTimeout(() => {
            changeNotifierClass(`${notifierClassName} fade-out`);
            timeout.current = null;
        }, time);
    }

    const shakeNotification = () => {
        changeNotifierClass(`${notifierClassName} fade-in`);
        setTimeout(() => {
            changeNotifierClass(`${notifierClassName} fade-in shake-element`);
        }, 100);
    }

    const triggerAlert = () => {
        if (timeout.current == null) {
            setAlertTimeOut(5000);
            changeNotifierClass(`${notifierClassName} fade-in`);
        } else {
            clearTimeout(timeout.current);
            setAlertTimeOut(5000);
            shakeNotification();

        }
    }

    return (
        <div id="alert-notifier" className={notifierClass} onAnimationStart={() => { dispatch(messageDisplayed()); }}>
            <div className='alert-notifier-head' style={{ color: `rgba(${iconColor}, 0.6)` }}>
                <div>
                    <i style={{ fontSize: '1rem', marginLeft: '5px' }} className="fa light input-icon">{icon}</i>
                </div>
                <div style={{ fontWeight: '600', fontSize: '17px' }}>{alertMessage.header}</div>
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <button className="btn-hover-close"
                        style={{ background: 'transparent', right: '0px', border: '0', lineHeight: '12px', color: `rgba(${iconColor}, 0.4)` }} onClick={closeAlert}>
                        <i style={{ fontSize: '1.4em' }} className="fa light">&#xf00d;</i>
                    </button>
                </div>
            </div>

            {alertMessage.msg && <div className="alert-banner-body">
                <div>
                    <p style={{ marginTop: 0, marginBottom: 0, marginLeft: '5px', marginRight: '5px', lineHeight: '1.3em', whiteSpace: 'pre-line', color: '#D5D5D5', textAlign: 'center', width: '100%' }}>
                        {alertMessage.msg}
                    </p>
                </div>
            </div>
            }
        </div >
    )
};

export default Notifier;
