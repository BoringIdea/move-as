'use client'

import { Header } from '@/components/header'
import { useState } from 'react'
import { 
  MetricsCards,
  MarketsTable,
  VolumeTrendChart,
  OIDistributionChart,
  LiveTradeFeed,
  FundingRatesWidget,
  LeaderboardWidget
} from '@/components/analysis'
import { 
  MetricsCardsSkeleton,
  MarketsTableSkeleton,
  VolumeTrendChartSkeleton,
  OIDistributionChartSkeleton,
  LiveTradeFeedSkeleton,
  FundingRatesWidgetSkeleton,
  LeaderboardWidgetSkeleton,
  UserActivitySkeleton,
  UserTasksSkeleton
} from '@/components/analysis/skeletons'
import { 
  usePlatformMetrics,
  useMarkets,
  useVolumeData,
  useRecentTrades,
  useLeaderboard
} from '@/hooks/useMarketDataOptimized'
import { useUserActivity } from '@/hooks/useUserActivity'
import { useUserTasks } from '@/hooks/useUserTasks'
import { useChain } from '@/components/providers/chain-provider'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Shield } from 'lucide-react'

type TabKey = 'analysis' | 'activity' | 'tasks'

export default function DecibelProtocolOptimizedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('analysis')
  
  // Use separate hooks for progressive loading
  const { data: platformMetrics, loading: isMetricsLoading, error: metricsError } = usePlatformMetrics()
  const { data: markets, loading: isMarketsLoading, error: marketsError } = useMarkets()
  const { data: volumeData, loading: isVolumeLoading, error: volumeError } = useVolumeData()
  const { data: trades, loading: isTradesLoading, error: tradesError } = useRecentTrades()
  const { data: leaderboard, loading: isLeaderboardLoading, error: leaderboardError } = useLeaderboard()

  // Wallet detection (Aptos/Sui only)
  const { currentChain } = useChain()
  const suiAccount = useCurrentAccount()
  const { account: aptosAccount } = useWallet()
  const userAddress = currentChain === 'sui' ? suiAccount?.address : aptosAccount?.address

  const { events, summary, account, volumeByMarket, isLoading: isActivityLoading } = useUserActivity(userAddress, markets || [])
  const { tasks, badges, isLoading: isTasksLoading } = useUserTasks(userAddress, events, summary, account)

  // Show error only if there's a critical error (metrics error is most critical)
  if (metricsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <Shield className="w-16 h-16" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Market Data</h2>
            <p className="text-gray-600">{metricsError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Decibel Protocol</h1>
          <p className="text-gray-600">Perpetual DEX analytics and insights</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-blue-200/60">
          <div className="flex gap-4">
            {([
              { key: 'analysis', label: 'Analysis' },
              { key: 'activity', label: 'My Activity' },
              { key: 'tasks', label: 'Tasks & Badges' },
            ] as { key: TabKey; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 -mb-px border-b-2 font-semibold transition-colors ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-blue-700 hover:border-blue-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Hero Metrics */}
            {isMetricsLoading ? (
              <MetricsCardsSkeleton />
            ) : platformMetrics ? (
              <MetricsCards metrics={platformMetrics} />
            ) : (
              <MetricsCardsSkeleton />
            )}

            {/* Markets Table */}
            <div className="mb-8">
              {isMarketsLoading ? (
                <MarketsTableSkeleton />
              ) : markets && markets.length > 0 ? (
                <MarketsTable markets={markets} />
              ) : (
                <MarketsTableSkeleton />
              )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {isVolumeLoading ? (
                <VolumeTrendChartSkeleton />
              ) : volumeData && volumeData.length > 0 ? (
                <VolumeTrendChart data={volumeData} />
              ) : (
                <VolumeTrendChartSkeleton />
              )}
              
              {isMarketsLoading ? (
                <OIDistributionChartSkeleton />
              ) : markets && markets.length > 0 ? (
                <OIDistributionChart markets={markets} />
              ) : (
                <OIDistributionChartSkeleton />
              )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {isMarketsLoading ? (
                <FundingRatesWidgetSkeleton />
              ) : markets && markets.length > 0 ? (
                <FundingRatesWidget markets={markets} />
              ) : (
                <FundingRatesWidgetSkeleton />
              )}
              
              {isTradesLoading ? (
                <LiveTradeFeedSkeleton />
              ) : trades && trades.length > 0 ? (
                <LiveTradeFeed trades={trades} />
              ) : (
                <LiveTradeFeedSkeleton />
              )}
            </div>

            {/* Leaderboard */}
            {isLeaderboardLoading ? (
              <LeaderboardWidgetSkeleton />
            ) : leaderboard && leaderboard.length > 0 ? (
              <LeaderboardWidget data={leaderboard} />
            ) : (
              <LeaderboardWidgetSkeleton />
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Wallet state */}
            {!userAddress && (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h2>
                <p className="text-gray-600">Please connect your {currentChain.toUpperCase()} wallet to view your activity.</p>
              </div>
            )}

            {/* Account Overview */}
            {userAddress && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                  {isActivityLoading ? (
                    <div className="text-gray-500">Loading...</div>
                  ) : account ? (
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Equity</span><span className="font-semibold">${(account.perp_equity_balance ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Unrealized PnL</span><span className={`font-semibold ${(account.unrealized_pnl ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(account.unrealized_pnl ?? 0) >= 0 ? '+' : ''}${Math.abs(account.unrealized_pnl ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Margin Ratio</span><span className="font-semibold">{(((account.cross_margin_ratio ?? 0) * 100)).toFixed(2)}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Leverage</span><span className="font-semibold">{(account.cross_account_leverage_ratio ?? 0).toFixed(2)}x</span></div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No account data</div>
                  )}
                </div>

                <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Summary</h3>
                  {isActivityLoading ? (
                    <div className="text-gray-500">Loading...</div>
                  ) : summary ? (
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-gray-600">Total Trades</span><span className="font-semibold">{summary.totalTrades}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Win Rate</span><span className="font-semibold text-green-600">{summary.winRatePct}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Avg Notional</span><span className="font-semibold">${(summary.avgNotionalUSD ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Best Trade</span><span className="font-semibold text-green-600">${(summary.bestTradePnl ?? 0).toFixed(2)}</span></div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No summary</div>
                  )}
                </div>

                <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume by Market</h3>
                  {isActivityLoading ? (
                    <div className="text-gray-500">Loading...</div>
                  ) : volumeByMarket.length > 0 ? (
                    <div className="space-y-3">
                      {volumeByMarket.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{item.marketName}</span>
                            <span className="font-medium">${(item.volumeUSD ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(item.percentage ?? 0).toFixed(2)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No volume</div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {userAddress && (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Activity Timeline</h2>
                {isActivityLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 20).map((e, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${e.realizedPnl && e.realizedPnl >= 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{e.action}</span>
                            <span className="text-sm text-gray-600">on {e.marketName}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            ${e.notionalUSD.toFixed(2)} • {new Date(e.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {typeof e.realizedPnl === 'number' && (
                          <div className={`text-sm font-medium ${e.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {e.realizedPnl >= 0 ? '+' : ''}${Math.abs(e.realizedPnl).toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No recent activity</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Wallet state */}
            {!userAddress && (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h2>
                <p className="text-gray-600">Please connect your {currentChain.toUpperCase()} wallet to view your tasks and badges.</p>
              </div>
            )}

            {/* Tasks */}
            {userAddress && (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reputation Tasks</h2>
                {isTasksLoading ? (
                  <div className="text-gray-500">Loading tasks...</div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className={`p-4 rounded-lg border ${
                        task.status === 'completed' ? 'bg-green-50 border-green-200' : 
                        task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              task.status === 'completed' ? 'bg-green-500 text-white' : 
                              task.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                              {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? Math.round(task.progress) : '○'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-600">{task.description}</div>
                              {task.tier && (
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                  task.tier === 'bronze' ? 'bg-yellow-100 text-yellow-700' :
                                  task.tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                                  task.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {task.tier}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              task.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {task.status === 'completed' ? 'Completed' : `${task.progress}%`}
                            </div>
                            {task.status !== 'completed' && (
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No tasks available</div>
                )}
              </div>
            )}

            {/* Badges */}
            {userAddress && (
              <div className="rounded-2xl border border-blue-200/60 bg-white/80 backdrop-blur p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Earned Badges</h2>
                {isTasksLoading ? (
                  <div className="text-gray-500">Loading badges...</div>
                ) : badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className={`text-center p-4 border rounded-lg ${
                        badge.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="text-2xl mb-2">{badge.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No badges earned yet</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
