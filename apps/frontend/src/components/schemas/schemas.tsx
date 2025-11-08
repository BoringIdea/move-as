import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import Link from "next/link"
import { Header } from '@/components/header'
import { Codec } from "@moveas/sdk"
import { bcs } from "@mysten/bcs"
import { useMediaQuery } from 'react-responsive';
import { Hex } from "@aptos-labs/ts-sdk";
import { fetchSchemas } from "@/api/schema";
import { Schema } from "@/api/types";

export function Schemas({
  chain, 
  network, 
  schemaCnt, 
  creatorCnt 
}: { 
  chain: string, 
  network: string, 
  schemaCnt: number, 
  creatorCnt: number 
}) {
  const router = useRouter()

  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(schemaCnt / itemsPerPage)

  useEffect(() => {
    const fetchDatas = async () => {
      setIsLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const response = await fetchSchemas(chain as any, network as any, { offset, limit: itemsPerPage });
        if (response.success) {
          setSchemas(response.data);
        } else {
          console.error('Failed to fetch schemas:', response.message);
          setSchemas([]);
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
        setSchemas([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatas();
  }, [chain, network, currentPage, itemsPerPage]);


  const getItem = function (schema: any) {
    if (schema.startsWith('0x')) {
      const schemaBytes = Hex.fromHexString(schema).toUint8Array()
      const codec = new Codec(bcs.string().parse(schemaBytes)).schemaItem()
      return codec
    }
    return new Codec(schema).schemaItem()
  }

  const formatValue = (value: any): string => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value === 'string' && value.endsWith('n')) {
      return BigInt(value.slice(0, -1)).toString();
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      );
    }
    return String(value);
  };

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-8 p-4 md:gap-10 md:p-8 lg:p-12 relative z-0">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100/30">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
              Schemas
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
              Explore and manage {chain.charAt(0).toUpperCase() + chain.slice(1)} attestation schemas
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={() => router.push('/schema/create')}
            className="w-full lg:w-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
          >
            Create Schema
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
              <div className="text-4xl md:text-5xl font-black text-indigo-700 mb-2">{schemaCnt?.toLocaleString() || '0'}</div>
              <p className="text-base text-indigo-600 font-medium">Available schemas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold text-blue-600">Unique Creators</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl md:text-5xl font-black text-blue-700 mb-2">{creatorCnt?.toLocaleString() || '0'}</div>
              <p className="text-base text-blue-600 font-medium">Active creators</p>
            </CardContent>
          </Card>
        </div>

        {/* Schemas Table Section */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-blue-100/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Schema Registry
            </h2>
            <p className="text-gray-600 font-medium">
              Browse and explore available attestation schemas
            </p>
          </div>
          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading schemas...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-blue-100/30 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                        <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">#</TableHead>
                        <TableHead className="w-[100px] px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">UID</TableHead>
                        {!isMobile && <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Schema</TableHead>}
                        {!isMobile && <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Resolver</TableHead>}
                        <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Attestations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schemas.map((row: Schema, index: number) => (
                        <TableRow key={index} className="border-b border-blue-50/30 hover:bg-blue-50/20 transition-colors duration-200">
                          <TableCell className="px-6 py-4">
                            <Link href="#" className="text-blue-500 hover:text-blue-600 transition-colors duration-200" prefetch={false}>
                              <Badge variant="blue" className="bg-blue-100/70 text-blue-700 border-blue-200/50 font-semibold px-3 py-1 rounded-lg">
                                #{row.id}
                              </Badge>
                            </Link>
                          </TableCell>
                          <TableCell className="px-6 py-4 space-y-2">
                            <Link href={`/schema/${row.address}`} prefetch={false} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                              {isMobile ? `${row.address.slice(0, 6)}...` : `${row.address.slice(0, 10)}...${row.address.slice(-10)}`}
                            </Link>
                            {!isMobile && (
                              <Badge variant="yellow" className="bg-amber-100/70 text-amber-700 border-amber-200/50 font-semibold px-3 py-1 rounded-lg">
                                {row.name}
                              </Badge>
                            )}
                          </TableCell>
                          {!isMobile && (
                            <TableCell className="px-6 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {getItem(row.schema).map((field: any, index: number) => (
                                  <Badge key={index} variant="yellow" className="p-2 flex flex-col items-center w-full break-words bg-amber-100/70 text-amber-700 border-amber-200/50 rounded-lg">
                                    <div className="text-xs text-amber-600 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium">
                                      {field.type.toUpperCase()} {field.vectorType ? `<${field.vectorType}>` : ''}
                                    </div>
                                    <div className="text-sm font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
                                      {field.name}
                                    </div>
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell className="px-6 py-4">
                              <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                                row.resolver != '0x0' 
                                  ? 'bg-green-100/70 text-green-700 border border-green-200/50' 
                                  : 'bg-gray-100/70 text-gray-600 border border-gray-200/50'
                              }`}>
                                {row.resolver != '0x0' ? 'Has resolver' : 'No resolver'}
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="px-6 py-4">
                            <Link
                              href={`/attestations/${row.address}`}
                              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                            >
                              {row.attestation_cnt || 0}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
                Page {currentPage} of {totalPages} ({schemaCnt} total)
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