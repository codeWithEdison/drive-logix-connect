import React from "react";

interface LoadingOverlayProps {
  message?: string;
  tip?: string;
  progress?: number; // 0-100
  fullscreen?: boolean;
  blurBackground?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Loading...",
  tip,
  progress,
  fullscreen = false,
  blurBackground = true,
  className,
}) => {
  return (
    <div
      className={
        fullscreen
          ? `fixed inset-0 z-[1000] ${
              blurBackground ? "backdrop-blur-sm" : ""
            } bg-white/60 dark:bg-black/40 flex items-center justify-center p-4 ${
              className || ""
            }`
          : `absolute inset-0 z-50 ${
              blurBackground ? "backdrop-blur-xs" : ""
            } bg-white/60 dark:bg-black/30 flex items-center justify-center p-3 ${
              className || ""
            }`
      }
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/70 bg-white/90 shadow-xl p-4 sm:p-5 dark:bg-gray-900/90 dark:border-gray-800">
        <div className="flex items-start gap-3">
          <div className="relative">
            <svg
              className="h-6 w-6 text-primary animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {message}
            </p>
            {tip && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {tip}
              </p>
            )}
            {typeof progress === "number" && (
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, progress))}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-right text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {Math.max(0, Math.min(100, Math.round(progress)))}%
                </div>
              </div>
            )}

            {!progress && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 [animation-delay:150ms]" />
                <div className="h-2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 [animation-delay:300ms]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InlineLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  label,
  className,
  size = "md",
}) => {
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <svg
        className={`${dim} text-primary animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {label}
        </span>
      )}
    </span>
  );
};


