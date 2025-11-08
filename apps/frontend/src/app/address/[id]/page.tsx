'use client'
import { useState, useEffect } from 'react';
import { getNetwork } from "@/utils/utils";
import { fetchAttestationsByUser, useAttestationCountByUser, useAttestationCountByCreator, useAttestationCountByRecipient } from "@/api";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuiAttestationTable } from "@/components/attestations/sui-attestation-table";
import { AptosAttestationTable } from "@/components/attestations/aptos-attestation-table";
import { useChain, Chain } from "@/components/providers/chain-provider";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { AttestationWithSchema } from "@/api/types";

export default function AddressPage({ params }: { params: { id: string } }) {
  const { currentChain, setCurrentChain } = useChain();
  const network = getNetwork();

  const { id } = params;

  const [attestations, setAttestations] = useState<AttestationWithSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: attestationsCntData, isLoading: isLoadingAttestationsCnt } = useAttestationCountByUser(id, currentChain, network as any);
  const { data: attestationCntByCreatorData, isLoading: isLoadingAttestationsCntByCreator } = useAttestationCountByCreator(id, currentChain, network as any);
  const { data: attestationCntByRecipientData, isLoading: isLoadingAttestationsCntByRecipient } = useAttestationCountByRecipient(id, currentChain, network as any);

  // Extract counts from API responses
  const attestationsCnt = attestationsCntData?.success ? attestationsCntData.data.count : 0;
  const attestationCntByCreator = attestationCntByCreatorData?.success ? attestationCntByCreatorData.data.count : 0;
  const attestationCntByRecipient = attestationCntByRecipientData?.success ? attestationCntByRecipientData.data.count : 0;

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(attestationsCnt / itemsPerPage)

  useEffect(() => {
    const fetchDatas = async () => {
      setIsLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const response = await fetchAttestationsByUser(id, currentChain, network as any, { offset, limit: itemsPerPage });
        if (response.success) {
          setAttestations(response.data);
        } else {
          console.error('Failed to fetch attestations:', response.message);
          setAttestations([]);
        }
      } catch (error) {
        console.error('Failed to fetch attestations:', error);
        setAttestations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatas();
  }, [currentPage, itemsPerPage, currentChain, network, id]);

  // Show loading while fetching initial data
  if (isLoadingAttestationsCnt || isLoadingAttestationsCntByCreator || isLoadingAttestationsCntByRecipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
        <Header />
        <LoadingOverlay 
          size="lg" 
          text="Loading Address Data..." 
          showBackground={false}
          className="min-h-[calc(100vh-4rem)]"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-8 p-4 md:gap-10 md:p-8 lg:p-12 relative z-0">
        {/* Hero Section */}
        <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100/30">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight mb-4">
              Attestations for Address
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium break-all font-mono">
              {id}
            </p>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
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
              <div className="text-4xl md:text-5xl font-black text-blue-700 mb-2">{attestationsCnt || 0}</div>
              <p className="text-base text-blue-600 font-medium">Total attestations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-indigo-600">Attestations Made</CardTitle>
              <div className="p-3 bg-gradient-to-br from-indigo-100/70 to-indigo-200/70 rounded-xl">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-indigo-700 mb-2">{attestationCntByCreator || 0}</div>
              <p className="text-base text-indigo-600 font-medium">Created attestations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50/50 to-white border-teal-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-teal-600">Attestations Received</CardTitle>
              <div className="p-3 bg-gradient-to-br from-teal-100/70 to-teal-200/70 rounded-xl">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-teal-700 mb-2">{attestationCntByRecipient || 0}</div>
              <p className="text-base text-teal-600 font-medium">Received attestations</p>
            </CardContent>
          </Card>
        </div>

        {/* Attestations Table Section */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-blue-100/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Attestation History
            </h2>
            <p className="text-gray-600 font-medium">
              All attestations associated with this address
            </p>
          </div>
          <div className="p-0">
            {isLoading ? (
              <LoadingOverlay 
                size="md" 
                text="Loading Attestations..." 
                showBackground={false}
                className="py-12"
              />
            ) : (
              currentChain === "sui" ? (
                <SuiAttestationTable attestations={attestations} />
              ) : (
                <AptosAttestationTable attestations={attestations} />
              )
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border border-blue-100/30">
            <Button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
            >
              First
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
            >
              &lt;
            </Button>
            <span className="text-sm font-semibold text-gray-700 px-6 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
            >
              &gt;
            </Button>
            <Button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 text-sm font-semibold bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-blue-200/50"
            >
              Last
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}