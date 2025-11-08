'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Database, Zap, Shield, Activity } from 'lucide-react'

interface RegistrationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  estimatedTime: number // in seconds
  status: 'pending' | 'in-progress' | 'completed'
}

interface PassportRegistrationProgressProps {
  isRegistering: boolean
  onComplete?: () => void
  progress?: {
    currentStep: number
    totalSteps: number
    elapsedTime: number
    estimatedTime: number
  }
  isBackendCompleted?: boolean
}

export function PassportRegistrationProgress({ isRegistering, onComplete, progress, isBackendCompleted }: PassportRegistrationProgressProps) {
  const [currentStep, setCurrentStep] = useState(progress?.currentStep || 0)
  const [elapsedTime, setElapsedTime] = useState(progress?.elapsedTime || 0)
  const [remainingTime, setRemainingTime] = useState(progress?.estimatedTime || 150)

  const steps: RegistrationStep[] = [
    {
      id: 'signature',
      title: 'Verify Signature',
      description: 'Verifying your wallet signature...',
      icon: <Shield className="w-5 h-5" />,
      estimatedTime: 10,
      status: 'pending'
    },
    {
      id: 'fetch-transactions',
      title: 'Fetch On-chain Data',
      description: 'Retrieving your transaction history from blockchain...',
      icon: <Database className="w-5 h-5" />,
      estimatedTime: 60,
      status: 'pending'
    },
    {
      id: 'analyze-activity',
      title: 'Analyze On-chain Activity',
      description: 'Analyzing your on-chain interaction patterns...',
      icon: <Activity className="w-5 h-5" />,
      estimatedTime: 40,
      status: 'pending'
    },
    {
      id: 'calculate-score',
      title: 'Calculate Passport Score',
      description: 'Computing your comprehensive score...',
      icon: <Zap className="w-5 h-5" />,
      estimatedTime: 30,
      status: 'pending'
    },
    {
      id: 'finalize',
      title: 'Complete Registration',
      description: 'Saving your Passport data...',
      icon: <CheckCircle className="w-5 h-5" />,
      estimatedTime: 10,
      status: 'pending'
    }
  ]

  // Calculate total estimated time
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0)

  // Update steps based on elapsed time
  useEffect(() => {
    if (!isRegistering) return

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + 1
        
        // Update current step based on elapsed time
        let stepIndex = 0
        let cumulativeTime = 0
        
        for (let i = 0; i < steps.length; i++) {
          cumulativeTime += steps[i].estimatedTime
          if (newElapsed <= cumulativeTime) {
            stepIndex = i
            break
          }
        }
        
        setCurrentStep(stepIndex)
        setRemainingTime(Math.max(0, totalEstimatedTime - newElapsed))
        
        return newElapsed
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRegistering, totalEstimatedTime, steps])

  // Update from external progress prop
  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.currentStep)
      setElapsedTime(progress.elapsedTime)
      setRemainingTime(Math.max(0, progress.estimatedTime - progress.elapsedTime))
    }
  }, [progress])

  // Reset when registration starts
  useEffect(() => {
    if (isRegistering) {
      setElapsedTime(0)
      setCurrentStep(0)
      setRemainingTime(totalEstimatedTime)
    }
  }, [isRegistering, totalEstimatedTime])

  // Call onComplete when backend is completed
  useEffect(() => {
    if (isBackendCompleted && isRegistering) {
      setTimeout(() => {
        onComplete?.()
      }, 1000)
    }
  }, [isBackendCompleted, isRegistering, onComplete])

  if (!isRegistering) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const progressPercentage = Math.min((elapsedTime / totalEstimatedTime) * 100, 100)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Passport</h2>
          <p className="text-gray-600">Please wait while we analyze your on-chain data</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {Math.round(progressPercentage)}%</span>
            <span>Estimated remaining: {formatTime(remainingTime)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isPending = index > currentStep

            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium transition-colors duration-300 ${
                    isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </div>
                </div>

                {isActive && (
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Pro Tip</p>
              <p>First-time registration analyzes your complete on-chain history and may take 2-3 minutes. Subsequent updates will be faster!</p>
              {elapsedTime > 150 && !isBackendCompleted && (
                <p className="mt-2 text-orange-700 font-medium">
                  ⏳ Processing is taking longer than expected. We&apos;re extending the time to ensure complete analysis...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
