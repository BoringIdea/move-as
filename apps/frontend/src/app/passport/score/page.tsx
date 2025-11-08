'use client'

import { Header } from '@/components/header'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Award, Activity, Users, Zap, Shield, Globe } from 'lucide-react'
import { 
  usePassportOverviewBasic, 
  usePassportScoreHistory, 
  usePassportBadges, 
  usePassportActivity, 
  usePassportProtocols 
} from '@/hooks/usePassportData'

// Type definitions for better TypeScript support
interface ScoreHistoryPoint {
  date: string;
  score: number;
  breakdown?: any;
}

interface ActivityItem {
  action: string;
  protocol: string;
  amount: string;
  token: string;
  time: string;
  status: string;
  txHash: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useChain } from '@/components/providers/chain-provider'
import { getExplorerTxUrl } from '@/utils/utils'

// Skeleton components for loading states
const ScoreSkeleton = () => (
  <div className="md:col-span-2 rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
    </div>
    <div className="flex items-center gap-4">
      <div className="h-12 bg-gray-200 rounded w-24 animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
  </div>
)

const StatsSkeleton = () => (
  <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
)

const ChartSkeleton = () => (
  <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
        ))}
      </div>
    </div>
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
  </div>
)

const ActivitySkeleton = () => (
  <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start sm:items-center gap-3 p-2 sm:p-3 rounded-lg border border-gray-200">
          <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5 sm:mt-0 animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
)

const BadgesSkeleton = () => (
  <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const TipsSkeleton = () => (
  <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded mt-0.5 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function PassportScoreOptimizedPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const { currentChain } = useChain()
  
  // Get current wallet address based on chain
  const suiAccount = useCurrentAccount()
  const { account: aptosAccount } = useWallet()
  const currentUserAddress = currentChain === 'sui' ? suiAccount?.address : aptosAccount?.address
  
  // Use new lightweight hooks for progressive loading
  const { data: basicData, loading: basicLoading, error: basicError } = usePassportOverviewBasic(
    currentUserAddress || '', 
    currentChain || 'aptos'
  )
  
  const { data: scoreHistoryData, loading: scoreHistoryLoading, error: scoreHistoryError } = usePassportScoreHistory(
    currentUserAddress || '', 
    currentChain || 'aptos',
    selectedTimeRange
  )
  
  const { data: badgesData, loading: badgesLoading, error: badgesError } = usePassportBadges(
    currentUserAddress || '', 
    currentChain || 'aptos'
  )
  
  const { data: activityData, loading: activityLoading, error: activityError } = usePassportActivity(
    currentUserAddress || '', 
    currentChain || 'aptos',
    selectedTimeRange,
    5
  )
  
  const { data: protocolsData, loading: protocolsLoading, error: protocolsError } = usePassportProtocols(
    currentUserAddress || '', 
    currentChain || 'aptos'
  )

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (score >= 80) return { grade: 'A', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 70) return { grade: 'B', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const grade = basicData ? getScoreGrade(basicData.score) : { grade: 'D', color: 'text-gray-600', bg: 'bg-gray-100' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Passport Score</h1>
          <p className="text-gray-600">Your on-chain reputation breakdown and history</p>
        </div>

        {/* Score Overview - Load first */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {basicError ? (
            <div className="md:col-span-3 rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-6 shadow-sm">
              <div className="flex items-center justify-center py-8">
                <Shield className="w-8 h-8 text-red-500 mr-3" />
                <span className="text-red-600">Error loading basic data: {basicError}</span>
              </div>
            </div>
          ) : basicData ? (
            <>
              <div className="md:col-span-2 rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Current Score</h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
                    Grade {grade.grade}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-gray-900">{basicData.score.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-600">+2.3%</span>
                    <span className="text-gray-500 text-sm">vs last period</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Last updated: {basicData.lastUpdated ? new Date(basicData.lastUpdated).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Protocols</span>
                    <span className="font-semibold">{basicData.protocols || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Volume</span>
                    <span className="font-semibold">${basicData.volume ? (basicData.volume / 1000).toFixed(0) + 'K' : '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Badges</span>
                    <span className="font-semibold">{basicData.badges?.earned || 0}/{basicData.badges?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Trades</span>
                    <span className="font-semibold">47</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <ScoreSkeleton />
              <StatsSkeleton />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Score History Chart - Load second */}
            {scoreHistoryError ? (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-center py-8">
                  <Shield className="w-8 h-8 text-red-500 mr-3" />
                  <span className="text-red-600">Error loading score history: {scoreHistoryError}</span>
                </div>
              </div>
            ) : scoreHistoryData ? (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Score History</h2>
                  <div className="flex gap-2">
                    {['24h', '7d', '30d', '90d'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedTimeRange === range
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-end justify-between p-4">
                      {scoreHistoryData?.scoreHistory && scoreHistoryData.scoreHistory.length > 0 ? (
                        scoreHistoryData.scoreHistory.map((point: ScoreHistoryPoint, index: number) => (
                          <div key={index} className="flex flex-col items-center group relative">
                            <div
                              className="w-8 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                              style={{ height: `${(Number(point.score) / 100) * 200}px` }}
                            />
                            <div className="text-xs text-gray-600 mt-2">
                              {new Date(point.date).getDate()}
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                <div className="font-semibold">Score: {Number(point.score).toFixed(1)}</div>
                                <div className="text-gray-300">
                                  {new Date(point.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-500">No score history available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ChartSkeleton />
            )}

            {/* On-chain Activity - Load third */}
            {activityError ? (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-center py-8">
                  <Shield className="w-8 h-8 text-red-500 mr-3" />
                  <span className="text-red-600">Error loading activity: {activityError}</span>
                </div>
              </div>
            ) : activityData ? (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">On-chain Activity</h2>
                <div className="space-y-3">
                  {activityData?.recentActivity && activityData.recentActivity.length > 0 ? (
                    activityData.recentActivity.map((activity: ActivityItem, index: number) => (
                      <div key={index} className="flex items-start sm:items-center gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-1.5 sm:mt-0 ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{activity.action}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">on</span>
                              <span className="text-xs font-medium text-blue-600">{activity.protocol && activity.protocol.includes('0x') ? activity.protocol.slice(0, 6) + '...' + activity.protocol.slice(-4) : activity.protocol}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-2 sm:mb-0">
                            {activity.amount} • {activity.token} • {activity.time}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {activity.txHash ? (
                              <a 
                                href={`${getExplorerTxUrl(currentChain)}/${activity.txHash}?network=mainnet`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all"
                              >
                                {activity.txHash}
                              </a>
                            ) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No recent activity available</div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all transactions →
                  </a>
                </div>
              </div>
            ) : (
              <ActivitySkeleton />
            )}

            {/* Factor Breakdown - Load after activity */}
            {basicData ? (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Factor Breakdown</h2>
                <div className="space-y-4">
                  {basicData.breakdown ? (
                    Object.entries(basicData.breakdown).map(([key, value], index) => {
                      const factorNames = {
                        longevity: { name: 'Longevity', color: 'bg-orange-500', description: 'Account age and sustained activity' },
                        balance: { name: 'Balance', color: 'bg-green-500', description: 'Account balance and holdings' },
                        activity: { name: 'Activity', color: 'bg-blue-500', description: 'Trading frequency and consistency' },
                        diversity: { name: 'Diversity', color: 'bg-purple-500', description: 'Number of protocols interacted with' },
                        volume: { name: 'Volume', color: 'bg-yellow-500', description: 'Total trading volume across protocols' },
                        complexity: { name: 'Complexity', color: 'bg-red-500', description: 'Advanced DeFi interactions' },
                        social: { name: 'Social', color: 'bg-pink-500', description: 'Social reputation and badges' }
                      };
                      
                      const factor = factorNames[key as keyof typeof factorNames];
                      if (!factor) return null;
                      
                      const scoreValue = Number(value);
                      const maxScore = key === 'activity' ? 20 : key === 'diversity' ? 18 : key === 'volume' ? 15 : key === 'social' ? 15 : key === 'complexity' ? 12 : 10;
                      const percentage = (scoreValue / maxScore) * 100;
                      
                      return (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-3 h-3 rounded-full ${factor.color} flex-shrink-0`} />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900">{factor.name}</div>
                              <div className="text-sm text-gray-600">{factor.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${factor.color}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 whitespace-nowrap text-right w-12">{scoreValue.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">No breakdown data available</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {/* Badges - Load fourth */}
            {badgesError ? (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-center py-8">
                  <Shield className="w-8 h-8 text-red-500 mr-3" />
                  <span className="text-red-600">Error loading badges: {badgesError}</span>
                </div>
              </div>
            ) : badgesData ? (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Badges & Achievements</h2>
                <div className="space-y-4">
                  {badgesData?.badges && badgesData.badges.length > 0 ? (
                    badgesData.badges
                      .sort((a: Badge, b: Badge) => {
                        // Sort by progress: completed first, then by progress from high to low
                        if (a.earned && !b.earned) return -1;
                        if (!a.earned && b.earned) return 1;
                        if (a.earned && b.earned) {
                          // If both completed, sort by completion time (newest first)
                          const aTime = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
                          const bTime = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
                          return bTime - aTime;
                        }
                        // If both not completed, sort by progress from high to low
                        return b.progress - a.progress;
                      })
                      .map((badge: Badge) => (
                        <div key={badge.id} className={`p-3 rounded-lg border ${
                          badge.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{badge.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{badge.name}</div>
                              <div className="text-sm text-gray-600">{badge.description}</div>
                              {badge.earned ? (
                                <div className="text-xs text-green-600 mt-1">
                                  Earned on {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Unknown'}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{badge.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full"
                                      style={{ width: `${badge.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No badges available</div>
                  )}
                </div>
              </div>
            ) : (
              <BadgesSkeleton />
            )}

            {/* Optimization Tips - Load last */}
            {protocolsError ? (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-center py-8">
                  <Shield className="w-8 h-8 text-red-500 mr-3" />
                  <span className="text-red-600">Error loading tips: {protocolsError}</span>
                </div>
              </div>
            ) : protocolsData ? (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Tips</h2>
                <div className="space-y-3">
                  {protocolsData?.optimizationTips && protocolsData.optimizationTips.length > 0 ? (
                    protocolsData.optimizationTips.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">Improvement Suggestion</div>
                          <div className="text-sm text-gray-600">{tip}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No optimization tips available</div>
                  )}
                </div>
              </div>
            ) : (
              <TipsSkeleton />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
