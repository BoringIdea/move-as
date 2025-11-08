'use client'
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { LinkIcon } from "@/components/icons";
import { formatDistanceToNow } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

export function SuiAttestationTable(
  { attestations, usePagination = true }:
    {
      attestations: any[], usePagination?: boolean
    }) {

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-blue-100/30 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
              <TableHead className="w-[100px] px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">UID</TableHead>
              {!isMobile && <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Schema</TableHead>}
              <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">From</TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">To</TableHead>
              {!isMobile && <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Type</TableHead>}
              <TableHead className="px-6 py-4 text-left text-sm font-bold text-blue-600 uppercase tracking-wider">Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attestations.map((attestation: any, index: number) => (
              <TableRow 
                key={index} 
                className="border-b border-blue-50/30 hover:bg-blue-50/20 transition-colors duration-200"
              >
                <TableCell className="px-6 py-4">
                  <Link 
                    href={`/attestation/${attestation.address}`} 
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {isMobile ? attestation.address.slice(0, 6) + '...' : attestation.address.slice(0, 10) + '...' + attestation.address.slice(-10)}
                  </Link>
                </TableCell>
                {!isMobile && (
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/schema/${attestation.schema_address}`} className="hover:opacity-80 transition-opacity duration-200">
                        <Badge variant="blue" className="bg-blue-100/70 text-blue-700 border-blue-200/50 font-semibold px-3 py-1 rounded-lg">
                          #{attestation.schema_id}
                        </Badge>
                      </Link>
                      {attestation.schema_name && (
                        <Badge variant="yellow" className="bg-amber-100/70 text-amber-700 border-amber-200/50 font-semibold px-3 py-1 rounded-lg">
                          {attestation.schema_name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell className="px-6 py-4">
                  <Link 
                    href={`/address/${attestation.attestor}`} 
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {isMobile ? attestation.attestor.slice(0, 6) + '...' : attestation.attestor.slice(0, 10) + '...' + attestation.attestor.slice(-10)}
                  </Link>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Link 
                    href={`/address/${attestation.recipient}`} 
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {isMobile 
                      ? attestation.recipient.slice(0, 6) + '...' 
                      : attestation.recipient.slice(0, 10) + '...' + attestation.recipient.slice(-10)}
                  </Link>
                </TableCell>
                {!isMobile && (
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-600 bg-gray-100/70 px-3 py-1 rounded-lg">ONCHAIN</span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-medium">
                    {formatDistanceToNow(new Date(Number(attestation.time)).toUTCString(), { addSuffix: true })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* {usePagination && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <Button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm"
          >
            First
          </Button>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm"
          >
            &lt;
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm"
          >
            &gt;
          </Button>
          <Button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm"
          >
            Last
          </Button>
        </div>
      )} */}
    </div>
  )
}