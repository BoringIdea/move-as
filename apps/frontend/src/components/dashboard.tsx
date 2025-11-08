'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuiAttestationTable } from '@/components/attestations/sui-attestation-table';
import { AptosAttestationTable } from '@/components/attestations/aptos-attestation-table';
import { fetchAttestations } from '@/api/attestation';
import { useChain, Chain } from "@/components/providers/chain-provider"
import { getNetwork } from "@/utils/utils";
import { AttestationWithSchema } from "@/api/types";

export function Dashboard({
  chain,
  attestorCount,
  attestationCount,
  schemaCount
}: {
  chain: string;
  attestorCount: number;
  attestationCount: number;
  schemaCount: number;
}) {
  const router = useRouter();
  const { currentChain, setCurrentChain } = useChain();
  const network = getNetwork();

  const [attestations, setAttestations] = useState<AttestationWithSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(attestationCount / itemsPerPage);

  useEffect(() => {
    const fetchDatas = async () => {
      setIsLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const response = await fetchAttestations(currentChain, network as any, { offset, limit: itemsPerPage });
        if (response.success) {
          setAttestations(response.data);
        } else {
          console.error('Failed to fetch attestations:', response.message);
          setAttestations([]);
        }
      } catch (error) {
        console.error('Error fetching attestations:', error);
        setAttestations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatas();
  }, [currentPage, itemsPerPage, currentChain, network]);

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-8 p-4 md:gap-10 md:p-8 lg:p-12 relative z-0">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100/30">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
              Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
              Monitor and analyze {chain.charAt(0).toUpperCase() + chain.slice(1)} Attestation activity in real-time
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={() => router.push('/schema/search')}
            className="w-full lg:w-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
          >
            Make Attestation
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Attestations Card */}
          <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-blue-600">Total Attestations</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-blue-700 mb-2">{attestationCount?.toLocaleString() || '0'}</div>
              <p className="text-base text-blue-600 font-medium">Total attestations created</p>
            </CardContent>
          </Card>

          {/* Total Schemas Card */}
          <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-indigo-600">Total Schemas</CardTitle>
              <div className="p-3 bg-gradient-to-br from-indigo-100/70 to-indigo-200/70 rounded-xl">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-indigo-700 mb-2">{schemaCount?.toLocaleString() || '0'}</div>
              <p className="text-base text-indigo-600 font-medium">Available schemas</p>
            </CardContent>
          </Card>

          {/* Unique Attestors Card */}
          <Card className="bg-gradient-to-br from-teal-50/50 to-white border-teal-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-teal-600">Unique Attestors</CardTitle>
              <div className="p-3 bg-gradient-to-br from-teal-100/70 to-teal-200/70 rounded-xl">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-teal-700 mb-2">{attestorCount?.toLocaleString() || '0'}</div>
              <p className="text-base text-teal-600 font-medium">Active attestors</p>
            </CardContent>
          </Card>
        </div>

        {/* Attestations Table Section */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-blue-100/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Recent Attestations
            </h2>
            <p className="text-gray-600 font-medium">
              Latest {chain.charAt(0).toUpperCase() + chain.slice(1)} attestation activities
            </p>
          </div>
          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading recent attestations...</div>
              </div>
            ) : (
              <>
                {chain === 'sui' ?
                  <SuiAttestationTable attestations={attestations} />
                  :
                  <AptosAttestationTable attestations={attestations} />
                }
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border border-blue-100/30">
              <Button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
              >
                First
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
              >
                &lt;
              </Button>
              <span className="text-sm font-semibold text-gray-700 px-6 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                Page {currentPage} of {totalPages} ({attestationCount} total)
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
              >
                &gt;
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}