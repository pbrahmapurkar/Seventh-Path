import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export type ModalType = 'confirm' | 'destructive' | 'info';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    type?: ModalType;
    primaryAction?: {
        label: string;
        onClick: () => void;
        isLoading?: boolean;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    children?: React.ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    type = 'confirm',
    primaryAction,
    secondaryAction,
    children
}: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Small delay to allow render before animation starts
            requestAnimationFrame(() => setIsAnimating(true));
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300); // Match CSS duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (type === 'destructive') {
                    triggerShake();
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, type]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (type === 'destructive') {
                triggerShake();
            } else {
                onClose();
            }
        }
    };

    if (!isVisible) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-[4px]"
                onClick={handleBackdropClick}
            />

            {/* Modal Surface */}
            <div
                className={`relative w-full max-w-[400px] bg-[#151C24] border border-[rgba(255,255,255,0.1)] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-6 transform transition-all duration-300 ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    } ${shake ? 'animate-shake' : ''}`}
                style={{
                    animation: shake ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none'
                }}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    {type === 'destructive' && (
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                    )}
                    <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
                    {description && (
                        <p className="text-slate-400 text-base leading-relaxed">{description}</p>
                    )}
                </div>

                {/* Content */}
                {children && <div className="mb-6">{children}</div>}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            disabled={primaryAction.isLoading}
                            className={`w-full h-[52px] rounded-xl font-medium text-base transition-all active:scale-[0.98] flex items-center justify-center ${type === 'destructive'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-[#10B981] hover:bg-[#0EA472] text-white'
                                } ${primaryAction.isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {primaryAction.isLoading ? 'Processing...' : primaryAction.label}
                        </button>
                    )}

                    {(secondaryAction || type !== 'destructive') && (
                        <button
                            onClick={secondaryAction?.onClick || onClose}
                            className="w-full h-[48px] rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            {secondaryAction?.label || 'Cancel'}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
        </div>,
        document.body
    );
}
