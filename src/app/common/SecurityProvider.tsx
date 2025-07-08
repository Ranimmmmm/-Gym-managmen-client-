import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityContextType {
    isUnlocked: boolean;
    checkCode: (code: string) => boolean;
    unlock: (code: string) => boolean;
    changeCode: (newCode: string) => void;
    codeSet: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const CODE_KEY = 'app_security_code';
const UNLOCK_KEY = 'app_security_unlocked';

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [codeSet, setCodeSet] = useState(false);

    useEffect(() => {
        const unlocked = localStorage.getItem(UNLOCK_KEY) === 'true';
        setIsUnlocked(unlocked);
        setCodeSet(!!localStorage.getItem(CODE_KEY));
    }, []);

    const checkCode = (code: string) => {
        const stored = localStorage.getItem(CODE_KEY);
        return stored === code;
    };

    const unlock = (code: string) => {
        if (checkCode(code)) {
            setIsUnlocked(true);
            localStorage.setItem(UNLOCK_KEY, 'true');
            return true;
        }
        return false;
    };

    const changeCode = (newCode: string) => {
        localStorage.setItem(CODE_KEY, newCode);
        setCodeSet(true);
        setIsUnlocked(false);
        localStorage.removeItem(UNLOCK_KEY);
    };

    return (
        <SecurityContext.Provider value={{ isUnlocked, checkCode, unlock, changeCode, codeSet }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const ctx = useContext(SecurityContext);
    if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
    return ctx;
}; 