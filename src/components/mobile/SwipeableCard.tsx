import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, MoreHorizontal } from "lucide-react";
import { deviceService } from "@/lib/services/deviceService";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  onMore,
  className = "",
  disabled = false,
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const MAX_SWIPE_DISTANCE = 200;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const currentTouchX = e.touches[0].clientX;
    const deltaX = currentTouchX - startX;

    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      const swipeDistance = Math.min(Math.abs(deltaX), MAX_SWIPE_DISTANCE);
      setCurrentX(-swipeDistance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;

    setIsDragging(false);

    if (Math.abs(currentX) > SWIPE_THRESHOLD) {
      setIsSwipeOpen(true);
      setCurrentX(-MAX_SWIPE_DISTANCE);
    } else {
      setIsSwipeOpen(false);
      setCurrentX(0);
    }
  };

  const handleActionClick = async (action: () => void) => {
    // Trigger haptic feedback
    await deviceService.triggerLightHaptic();

    // Close swipe
    setIsSwipeOpen(false);
    setCurrentX(0);

    // Execute action
    action();
  };

  const closeSwipe = () => {
    setIsSwipeOpen(false);
    setCurrentX(0);
  };

  // Close swipe when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        closeSwipe();
      }
    };

    if (isSwipeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSwipeOpen]);

  const hasActions = onEdit || onDelete || onMore;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={cardRef}>
      {/* Action buttons */}
      {hasActions && (
        <div className="absolute right-0 top-0 h-full flex items-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="flex items-center gap-1 px-2">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleActionClick(onEdit)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onMore && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleActionClick(onMore)}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleActionClick(onDelete)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main card */}
      <Card
        className={`transition-transform duration-200 ease-out ${
          isDragging ? "transition-none" : ""
        } ${disabled ? "opacity-50" : ""}`}
        style={{
          transform: `translateX(${currentX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">{children}</CardContent>
      </Card>

      {/* Swipe hint */}
      {hasActions && !isSwipeOpen && !disabled && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs opacity-50">
          ← Swipe
        </div>
      )}
    </div>
  );
};

export default SwipeableCard;
