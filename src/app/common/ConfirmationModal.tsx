import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-blue-600" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (type) {
            case 'danger':
                return 'danger' as const;
            case 'warning':
                return 'primary' as const;
            default:
                return 'primary' as const;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-medium animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                    {getIcon()}
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 transition-all duration-200"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonVariant()}
                        onClick={onConfirm}
                        loading={loading}
                        className="flex-1 transition-all duration-200"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}; 