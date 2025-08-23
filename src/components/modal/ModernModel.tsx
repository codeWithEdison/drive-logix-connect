import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowLeft, X } from 'lucide-react';

interface ModernModelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    modalType?: string;
    loading?: boolean;
    children?: React.ReactNode;
}

const ModernModel: React.FC<ModernModelProps> = ({
    isOpen,
    onClose,
    title,
    modalType = 'default',
    loading = false,
    children,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        currentY.current = e.touches[0].clientY;
        const deltaY = currentY.current - startY.current;

        // Only allow downward dragging
        if (deltaY > 0) {
            setDragOffset(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;

        const deltaY = currentY.current - startY.current;
        const threshold = 150; // Minimum distance to trigger close

        if (deltaY > threshold) {
            handleClose();
        } else {
            // Reset position with animation
            setDragOffset(0);
        }

        setIsDragging(false);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setDragOffset(0);
        }, 200);
    };

    if (!isOpen) return null;

    const transformStyle = {
        transform: `translateY(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    };

    const overlayOpacity = Math.max(0.3, 0.6 - (dragOffset / 500));

    return ReactDOM.createPortal(
        <div
            className="fixed top-0 left-0 w-screen h-[100vh] flex items-center justify-center z-50"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        >
            <div
                ref={modalRef}
                className="bg-white w-full h-full rounded-t-xl flex flex-col shadow-2xl relative mt-32 md:pb-8   pb-32  "  
                style={transformStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Swipe Indicator */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Sticky Header */}
                <div className="flex flex-row items-center justify-between border-b border-gray-200 pb-3 mx-0 px-6 py-4 bg-white sticky top-0 z-10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <button
                            className="flex gap-2 items-center text-primary bg-primary/10 rounded-lg py-2 px-3 hover:bg-primary/20 transition-colors duration-200"
                            onClick={handleClose}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        <h4 className="font-bold text-lg text-foreground">{title}</h4>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                    <div className="flex flex-col px-6 py-4 pb-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">{children}</div>
                        )}
                    </div>
                </div>

                {/* Bottom Safe Area */}
                <div className="h-4 bg-white"></div>
            </div>
        </div>,
        document.body
    );
};

export default ModernModel; 