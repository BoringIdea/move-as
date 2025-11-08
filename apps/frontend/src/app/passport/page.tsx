'use client'

import { Header } from '@/components/header'
import { useMemo } from 'react'
import { useDecibelOverview } from '@/hooks/useDecibelOverview'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Award, Activity, Users, Zap, Shield, Globe, Wallet } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { usePassportRegistration } from '@/hooks/usePassportRegistration'
import { useChain } from '@/components/providers/chain-provider'
import { usePassportOverview } from '@/hooks/usePassportData'
import { PassportRegistrationProgress } from '@/components/PassportRegistrationProgress'

export default function PassportHomePage() {
  const { data: decibelOverview, loading: decibelLoading, error: decibelError } = useDecibelOverview()
  const nf = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), [])
  const { currentChain } = useChain()
  
  // Format currency with M/K units
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }
  
  // Check wallet connection based on current chain
  const suiAccount = useCurrentAccount()
  const { account: aptosAccount } = useWallet()
  const isWalletConnected = currentChain === 'sui' ? !!suiAccount : !!aptosAccount
  
  const { isRegistered, isLoading: isRegistrationLoading, error: registrationError, registerPassport, isRegistering, isWaitingForSignature, registrationProgress, isBackendCompleted } = usePassportRegistration()
  
  // Get current wallet address based on chain
  const currentUserAddress = currentChain === 'sui' ? suiAccount?.address : aptosAccount?.address
  
  // Fetch passport overview data
  const { data: passportData, loading: passportLoading, error: passportError } = usePassportOverview(
    currentUserAddress || '', 
    currentChain || 'aptos'
  )

  // Format large numbers to K/M format
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`
    }
    return `$${num}`
  }

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-8 p-4 md:gap-10 md:p-8 lg:p-12 relative z-0">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100/30">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
              Passport
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
              Your on-chain reputation score and protocol explorer
            </p>
          </div>
          {!isWalletConnected ? (
            <button 
              disabled
              className="w-full lg:w-auto bg-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold text-lg text-center cursor-not-allowed opacity-60"
            >
              Connect Wallet to Continue
            </button>
          ) : isRegistrationLoading ? (
            <button 
              disabled
              className="w-full lg:w-auto bg-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold text-lg text-center cursor-not-allowed opacity-60"
            >
              Checking Registration...
            </button>
          ) : isRegistered === false ? (
            <div className="flex flex-col items-center space-y-3">
              <button 
                onClick={registerPassport}
                disabled={isRegistering || isWaitingForSignature}
                className="w-full lg:w-auto bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isWaitingForSignature ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Waiting for signature...</span>
                  </div>
                ) : isRegistering ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Register Passport'
                )}
              </button>
              
              {isWaitingForSignature && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Please sign the message in your wallet to continue...
                  </p>
                </div>
              )}
              
              {isRegistering && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Analyzing your on-chain data, please wait...
                  </p>
                  <div className="w-64 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-1 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((registrationProgress.elapsedTime / registrationProgress.estimatedTime) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time remaining: {Math.max(0, registrationProgress.estimatedTime - registrationProgress.elapsedTime)}s
                  </p>
                </div>
              )}
            </div>
          ) : isRegistered === true ? (
            <a 
              href="/passport/score"
              className="w-full lg:w-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg text-center"
            >
              View Score Details
            </a>
          ) : (
            <button 
              disabled
              className="w-full lg:w-auto bg-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold text-lg text-center cursor-not-allowed opacity-60"
            >
              Loading...
            </button>
          )}
          
          {registrationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-600 text-sm">{registrationError}</p>
            </div>
          )}
        </div>

        {/* Passport Score Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-50/50 to-white border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden md:col-span-2 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-purple-600">Passport Score</CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-100/70 to-purple-200/70 rounded-xl">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!isWalletConnected ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Connect your wallet to view your Passport score and on-chain reputation
                  </p>
                </div>
              ) : isRegistrationLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Checking your registration status
                  </p>
                </div>
              ) : isRegistered === false ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Your Passport</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Register to start building your on-chain reputation
                  </p>
                </div>
              ) : isRegistered === true ? (
                <>
                  {!passportData && passportLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Passport Data...</h3>
                      <p className="text-sm text-gray-600 text-center">
                        Fetching your on-chain reputation data
                      </p>
                    </div>
                  ) : passportError ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="p-4 bg-red-100/70 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                      <p className="text-sm text-red-600 text-center mb-4">
                        {passportError}
                      </p>
                    </div>
                  ) : passportData ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-5xl md:text-6xl font-black text-purple-700">{passportData.score.toFixed(2)}</div>
                        <div className="flex flex-col gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700`}>
                            Grade {passportData.grade}
                          </div>
                          <div className="flex items-center gap-1">
                            {passportData.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-semibold ${passportData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {passportData.change >= 0 ? '+' : ''}{passportData.changePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-base text-purple-600 font-medium">Your on-chain reputation score</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                        <Award className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                      <p className="text-sm text-gray-600 text-center">
                        No passport data found for this address
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-4 bg-purple-100/70 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Initializing...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          {!isWalletConnected ? (
            <>
              <Card className="bg-gradient-to-br from-gray-50/50 to-white border-gray-100/50 rounded-2xl overflow-hidden opacity-60">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-gray-400">Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-gray-100/70 to-gray-200/70 rounded-xl">
                    <Globe className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-4xl md:text-5xl font-black text-gray-400 mb-2">--</div>
                  <p className="text-base text-gray-400 font-medium">Connect wallet</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50/50 to-white border-gray-100/50 rounded-2xl overflow-hidden opacity-60">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-gray-400">Total Volume</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-gray-100/70 to-gray-200/70 rounded-xl">
                    <Zap className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-4xl md:text-5xl font-black text-gray-400 mb-2">--</div>
                  <p className="text-base text-gray-400 font-medium">Connect wallet</p>
                </CardContent>
              </Card>
            </>
          ) : isRegistrationLoading ? (
            <>
              <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-blue-600">Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-blue-100/70 rounded-full mb-4">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Checking registration...
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-green-600">Total Volume</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-green-100/70 to-green-200/70 rounded-xl">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-green-100/70 rounded-full mb-4">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Checking registration...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : isRegistered === false ? (
            <>
              <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-blue-600">Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-blue-100/70 rounded-full mb-4">
                      <Globe className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Register First</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Register to track protocol activity
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-green-600">Total Volume</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-green-100/70 to-green-200/70 rounded-xl">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-green-100/70 rounded-full mb-4">
                      <Zap className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Register First</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Register to track trading volume
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : isRegistered === true ? (
            <>
              {passportLoading ? (
                <>
                  <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-blue-600">Protocols</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                        <Globe className="w-6 h-6 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 bg-blue-100/70 rounded-full mb-4">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                        <p className="text-sm text-gray-600 text-center">
                          Fetching protocol data
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100/50 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-green-600">Total Volume</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-green-100/70 to-green-200/70 rounded-xl">
                        <Zap className="w-6 h-6 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 bg-green-100/70 rounded-full mb-4">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                        <p className="text-sm text-gray-600 text-center">
                          Fetching volume data
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : passportError ? (
                <>
                  <Card className="bg-gradient-to-br from-red-50/50 to-white border-red-100/50 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-red-600">Protocols</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-red-100/70 to-red-200/70 rounded-xl">
                        <Shield className="w-6 h-6 text-red-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 bg-red-100/70 rounded-full mb-4">
                          <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                        <p className="text-sm text-red-600 text-center">
                          Failed to load protocol data
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50/50 to-white border-red-100/50 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-red-600">Total Volume</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-red-100/70 to-red-200/70 rounded-xl">
                        <Shield className="w-6 h-6 text-red-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 bg-red-100/70 rounded-full mb-4">
                          <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                        <p className="text-sm text-red-600 text-center">
                          Failed to load volume data
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-blue-600">Protocols</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                        <Globe className="w-6 h-6 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="text-4xl md:text-5xl font-black text-blue-700 mb-2">{passportData?.protocols || 0}</div>
                      <p className="text-base text-blue-600 font-medium">Active protocols</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                      <CardTitle className="text-lg font-bold text-green-600">Total Volume</CardTitle>
                      <div className="p-3 bg-gradient-to-br from-green-100/70 to-green-200/70 rounded-xl">
                        <Zap className="w-6 h-6 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="text-4xl md:text-5xl font-black text-green-700 mb-2">{formatLargeNumber(passportData?.volume || 0)}</div>
                      <p className="text-base text-green-600 font-medium">Trading volume</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-blue-600">Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-blue-100/70 rounded-full mb-4">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Initializing...
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-green-600">Total Volume</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-green-100/70 to-green-200/70 rounded-xl">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-green-100/70 rounded-full mb-4">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Initializing...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Protocols Section */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-blue-100/30">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Protocol Explorer
              </h2>
              <p className="text-gray-600 font-medium">
                Discover and analyze DeFi protocols
              </p>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <a href="/passport/protocol/decibel" className="group">
                <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 rounded-2xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                    <CardTitle className="text-lg font-bold text-indigo-600">Decibel</CardTitle>
                    <div className="p-3 bg-gradient-to-br from-indigo-100/70 to-indigo-200/70 rounded-xl">
                      <Activity className="w-6 h-6 text-indigo-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-base text-indigo-600 font-medium mb-4">Perp DEX analytics and insights</p>
                    {decibelLoading ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/70 rounded-lg p-3 border border-blue-100/50">
                          <div className="text-xs text-gray-600 mb-1">24h Volume</div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-green-50/70 rounded-lg p-3 border border-green-100/50">
                          <div className="text-xs text-gray-600 mb-1">Open Interest</div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-purple-50/70 rounded-lg p-3 border border-purple-100/50">
                          <div className="text-xs text-gray-600 mb-1">Active Markets</div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-orange-50/70 rounded-lg p-3 border border-orange-100/50">
                          <div className="text-xs text-gray-600 mb-1">Traders</div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : decibelError ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-red-600">Failed to load data</p>
                      </div>
                    ) : decibelOverview ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/70 rounded-lg p-3 border border-blue-100/50">
                          <div className="text-xs text-gray-600 mb-1">24h Volume</div>
                          <div className="font-bold text-gray-900 text-sm">{formatCurrency(decibelOverview.total24hVolume)}</div>
                        </div>
                        <div className="bg-green-50/70 rounded-lg p-3 border border-green-100/50">
                          <div className="text-xs text-gray-600 mb-1">Open Interest</div>
                          <div className="font-bold text-gray-900 text-sm">{formatCurrency(decibelOverview.totalOpenInterest)}</div>
                        </div>
                        <div className="bg-purple-50/70 rounded-lg p-3 border border-purple-100/50">
                          <div className="text-xs text-gray-600 mb-1">Active Markets</div>
                          <div className="font-bold text-gray-900 text-sm">{decibelOverview.activeMarkets}/{decibelOverview.totalMarkets}</div>
                        </div>
                        <div className="bg-orange-50/70 rounded-lg p-3 border border-orange-100/50">
                          <div className="text-xs text-gray-600 mb-1">Traders</div>
                          <div className="font-bold text-gray-900 text-sm">{nf.format(decibelOverview.activeTraders)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </a>

              {/* Placeholder for more protocols */}
              <Card className="bg-gradient-to-br from-gray-50/50 to-white border-gray-100/50 rounded-2xl overflow-hidden opacity-60">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-gray-400">More Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-gray-100/70 to-gray-200/70 rounded-xl">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-base text-gray-400 font-medium mb-4">Coming soon...</p>
                  <div className="text-sm text-gray-400">Additional protocols will be added here</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50/50 to-white border-gray-100/50 rounded-2xl overflow-hidden opacity-60">
                <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold text-gray-400">More Protocols</CardTitle>
                  <div className="p-3 bg-gradient-to-br from-gray-100/70 to-gray-200/70 rounded-xl">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-base text-gray-400 font-medium mb-4">Coming soon...</p>
                  <div className="text-sm text-gray-400">Additional protocols will be added here</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Registration Progress Modal - Only show when backend processing starts */}
      <PassportRegistrationProgress 
        isRegistering={isRegistering}
        progress={registrationProgress}
        isBackendCompleted={isBackendCompleted}
        onComplete={() => {
          // Registration completed, refresh the page or update state
          window.location.reload()
        }}
      />
    </div>
  )
}