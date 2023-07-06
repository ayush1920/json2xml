import { useRef, useEffect, useState } from 'react'

export const useIsMount = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
        isMountRef.current = false;
    }, []);
    return isMountRef.current;
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));