import React, { useState } from "react";
import ModernModel from "@/components/modal/ModernModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Heart, ThumbsUp, Smile, Award } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoId: string;
  cargoNumber?: string;
  onRate: (data: { rating: number; review?: string }) => void;
  isLoading?: boolean;
}

export function RatingModal({
  isOpen,
  onClose,
  cargoId,
  cargoNumber,
  onRate,
  isLoading = false,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const { toast } = useToast();

  const ratingLabels = {
    1: "Very Poor",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent",
  };

  const ratingEmojis = {
    1: "😞",
    2: "😕",
    3: "😐",
    4: "😊",
    5: "🤩",
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    onRate({
      rating,
      review: review.trim() || undefined,
    });
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setReview("");
    onClose();
  };

  const currentRating = hoveredRating || rating;
  const currentLabel = ratingLabels[currentRating as keyof typeof ratingLabels];
  const currentEmoji = ratingEmojis[currentRating as keyof typeof ratingEmojis];

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={handleClose}
      title="Rate Your Delivery Experience"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="h-8 w-8 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              How was your delivery?
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Cargo {cargoNumber || cargoId}
          </p>
        </div>

        {/* Star Rating */}
        <div className="text-center space-y-4">
          {/* Emoji and Label */}
          <div className="space-y-2">
            <div className="text-4xl">{currentEmoji || "⭐"}</div>
            <p className="text-lg font-medium text-gray-800">
              {currentLabel || "Select a rating"}
            </p>
          </div>

          {/* Stars */}
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= currentRating;
              const isHovered = star <= hoveredRating;

              return (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-all duration-200 transform hover:scale-110"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  disabled={isLoading}
                >
                  <Star
                    className={`h-12 w-12 transition-all duration-200 ${
                      isFilled || isHovered
                        ? "text-yellow-400 fill-current drop-shadow-lg"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                    style={{
                      filter:
                        isFilled || isHovered
                          ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))"
                          : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Rating Description */}
          <div className="text-sm text-gray-500">
            {rating === 0 && "Tap a star to rate"}
            {rating === 1 &&
              "We're very sorry to hear that. We'll work hard to improve!"}
            {rating === 2 &&
              "We're sorry for the poor experience. We'll do better next time."}
            {rating === 3 &&
              "Thanks for the feedback. We appreciate your input."}
            {rating === 4 && "Great! We're glad you had a good experience."}
            {rating === 5 && "Excellent! Thank you for the outstanding rating!"}
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Share your experience (optional)
          </label>
          <Textarea
            placeholder="Tell us about your delivery experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {review.length}/500 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg"
            disabled={isLoading || rating === 0}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2 fill-current" />
                Submit Rating
              </>
            )}
          </Button>
        </div>

        {/* Fun Elements */}
        <div className="flex justify-center space-x-4 text-gray-400">
          <Heart className="h-5 w-5" />
          <ThumbsUp className="h-5 w-5" />
          <Smile className="h-5 w-5" />
        </div>
      </div>
    </ModernModel>
  );
}
