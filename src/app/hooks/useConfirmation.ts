import { useState, useCallback } from 'react';

interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState extends ConfirmationOptions {
    isOpen: boolean;
    onConfirm: (() => void) | null;
}

export const useConfirmation = () => {
    const [state, setState] = useState<ConfirmationState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'danger',
        onConfirm: null,
    });

    const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                ...options,
                onConfirm: () => {
                    setState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
                    resolve(true);
                },
            });
        });
    }, []);

    const close = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
    }, []);

    const handleConfirm = useCallback(() => {
        if (state.onConfirm) {
            state.onConfirm();
        }
    }, [state.onConfirm]);

    return {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        type: state.type,
        confirm,
        close,
        handleConfirm,
    };
}; 