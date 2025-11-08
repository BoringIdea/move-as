'use client'

import { useState, useEffect } from 'react';

interface DecibelOverview {
  total24hVolume: number;
  totalOpenInterest: number;
  activeMarkets: number;
  totalMarkets: number;
  activeTraders: number;
}

interface UseDecibelOverviewReturn {
  data: DecibelOverview | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_DECIBEL_API_URL || 'https://trading-api-http-dev-netna-us-central1-410192433417.us-central1.run.app';

export function useDecibelOverview(): UseDecibelOverviewReturn {
  const [data, setData] = useState<DecibelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel fetch basic data, only fetch the core metrics needed for the overview
        const [contextsResponse, leaderboardResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/asset_contexts`),
          fetch(`${API_BASE_URL}/api/v1/leaderboard?limit=100`)
        ]);

        if (!contextsResponse.ok) {
          throw new Error(`Failed to fetch contexts: ${contextsResponse.status}`);
        }

        const contexts = await contextsResponse.json();
        
        // Process leaderboard data (optional)
        let leaderboardData = { total_count: 0, items: [] };
        if (leaderboardResponse.ok) {
          leaderboardData = await leaderboardResponse.json();
        }

        if (!mounted) return;

        // Calculate basic metrics - only calculate the core data needed for the overview
        const contextsArray = Array.isArray(contexts) ? contexts : [];
        
        // API volume_24h returns token amounts, not USD values
        // Need to multiply by mark_price to get USD volume
        const total24hVolume = contextsArray.reduce((sum: number, ctx: any) => {
          const tokenVolume = ctx.volume_24h || 0;
          const price = ctx.mark_price || 0;
          return sum + (tokenVolume * price);
        }, 0);
        const totalOpenInterest = contextsArray.reduce((sum: number, ctx: any) => sum + (ctx.open_interest || 0), 0);
        const activeMarkets = contextsArray.filter((ctx: any) => ctx.volume_24h > 0).length;
        const totalMarkets = contextsArray.length;
        const activeTraders = leaderboardData.total_count || leaderboardData.items?.length || 0;

        setData({
          total24hVolume,
          totalOpenInterest,
          activeMarkets,
          totalMarkets,
          activeTraders,
        });
      } catch (err) {
        console.error('Error fetching Decibel overview:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    // Set automatic refresh (optional, low frequency)
    const interval = setInterval(fetchOverview, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
