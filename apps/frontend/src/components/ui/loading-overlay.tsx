import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  showBackground?: boolean
}

export function LoadingOverlay({ 
  className, 
  size = "md", 
  text = "Loading...",
  showBackground = true 
}: LoadingOverlayProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px]",
      showBackground && "bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30",
      className
    )}>
      {/* Animated Spinner */}
      <div className={cn(
        "relative",
        sizeClasses[size]
      )}>
        {/* Outer ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-blue-200/50",
          sizeClasses[size]
        )} />
        
        {/* Animated inner ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin",
          sizeClasses[size]
        )} />
        
        {/* Center dot */}
        <div className={cn(
          "absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600",
          size === "sm" ? "inset-1.5" : "inset-2"
        )} />
      </div>

      {/* Loading text */}
      {text && (
        <div className="mt-4 text-center">
          <p className={cn(
            "font-medium text-gray-600 animate-pulse",
            textSizes[size]
          )}>
            {text}
          </p>
        </div>
      )}

      {/* Decorative dots */}
      <div className="flex space-x-1 mt-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Full page loading component
export function FullPageLoading({ 
  text = "Loading...",
  showHeader = true 
}: { 
  text?: string
  showHeader?: boolean 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      {showHeader && (
        <div className="h-16 bg-white/90 backdrop-blur-sm border-b border-blue-100/30" />
      )}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          {/* Large animated logo or icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-8 border-blue-200/30" />
            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Loading text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{text}</h2>
          <p className="text-gray-600 mb-6">Please wait while we prepare your content</p>

          {/* Progress bar */}
          <div className="w-64 h-2 bg-blue-100/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" />
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Page transition loading component
export function PageTransitionLoading({ 
  text = "Loading Page...",
  showProgress = true 
}: { 
  text?: string
  showProgress?: boolean 
}) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-6 border-blue-200/30" />
          <div className="absolute inset-0 rounded-full border-6 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Loading text */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{text}</h3>
        
        {/* Progress indicator */}
        {showProgress && (
          <div className="w-48 h-1.5 bg-blue-100/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" />
          </div>
        )}

        {/* Animated dots */}
        <div className="flex justify-center space-x-1.5 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Skeleton loading component for content
export function SkeletonLoading({ 
  className,
  lines = 3,
  showAvatar = false 
}: { 
  className?: string
  lines?: number
  showAvatar?: boolean 
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-200/50 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-blue-200/50 rounded w-32" />
            <div className="h-3 bg-blue-200/50 rounded w-24" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-4 bg-blue-200/50 rounded",
              i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  )
}