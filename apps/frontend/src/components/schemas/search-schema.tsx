'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Header } from "@/components/header"
import { SearchIconBlack } from "../icons"
import { searchSchemas } from "@/api/schema"
import { getNetwork } from "@/utils/utils"
import { useChain, Chain } from "@/components/providers/chain-provider";

interface SearchResult {
  id: string;
  uid: string;
}

export function SearchSchema({chain}: {chain: Chain}) {
  const network = getNetwork();
  const [searchInput, setSearchInput] = useState("")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    console.log('searchInput', searchInput)
    if (!searchInput.trim()) {
      console.log('searchInput is empty')
      setSearchResult(null)
      return
    }

    let result: any

    const response = await searchSchemas(chain, network as any, { searchInput })
    let schemasResult = response.success ? response.data : []
    console.log('schemasResult', schemasResult)

    if (schemasResult && schemasResult.length > 0) {
      const schema = schemasResult[0]
      setSearchResult({
        id: schema.id.toString(),
        uid: schema.address
      })
    } else {
      setSearchResult(null)
      console.log("No matching schema found.")
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex-grow flex flex-col items-center w-full p-4 md:p-8 lg:p-12 space-y-8 mt-16">
        {/* Hero Section */}
        <header className="text-center space-y-4">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">MAKE AN ATTESTATION</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
            Choose your attestation schema
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
            Search and select the perfect schema for your attestation needs
          </p>
        </header>

        {/* Search Section */}
        <div className="w-full max-w-3xl p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Search for a schema</h2>
          <p className="text-center text-gray-600 font-medium mb-6">Type in the schema # or the UID of the schema</p>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by Schema # / UID"
              className="w-full pl-6 pr-20 py-4 border border-blue-200/50 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200 text-lg"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button
              variant="default"
              className="absolute right-1 top-1 h-12 px-6 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-200"
              onClick={handleSearch}
            >
              <SearchIconBlack className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Result Section */}
        <div className="w-full max-w-3xl p-6 md:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Search Result</h3>
          {searchResult ? (
            <Link href={`/schema/${searchResult.uid}`} className="block">
              <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 space-y-3 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 border border-blue-200/50">
                <Badge variant="blue" className="bg-blue-100/70 text-blue-700 border-blue-200/50 font-semibold px-4 py-2 rounded-lg text-lg">
                  #{searchResult.id}
                </Badge>
                <div className="w-full sm:w-auto">
                  <p className="text-sm text-blue-600 font-medium break-all">{searchResult.uid}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4 font-medium">No matching schema found.</p>
              <Link href="/schemas" className="inline-flex items-center px-6 py-3 bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 font-semibold rounded-xl border border-blue-200/50 transition-all duration-200 hover:scale-105">
                View all schemas
              </Link>
            </div>
          )}
        </div>

        {/* Featured Schemas Section */}
        <div className="w-full max-w-4xl p-6 md:p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30">
          <p className="text-center font-bold text-lg text-gray-800 mb-6">Don&apos;t know the UID or #? Explore a few featured schemas.</p>
          <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
            <a href="#" className="flex items-center p-4 space-x-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 border border-blue-200/50 group">
              <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold">#7</Badge>
              <div>
                <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">WRITE A MESSAGE</p>
                <p className="text-sm text-gray-600">0x3969bb...0ac0822f</p>
              </div>
            </a>
            <a href="#" className="flex items-center p-4 space-x-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 border border-blue-200/50 group">
              <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold">#8</Badge>
              <div>
                <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">MAKE A STATEMENT</p>
                <p className="text-sm text-gray-600">0xf58b8b...1456cafe</p>
              </div>
            </a>
            <a href="#" className="flex items-center p-4 space-x-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 border border-blue-200/50 group">
              <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold">#14</Badge>
              <div>
                <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">IS AN ACCREDITED INVESTOR</p>
                <p className="text-sm text-gray-600">0x080b93...3ae73f19</p>
              </div>
            </a>
            <a href="#" className="flex items-center p-4 space-x-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200 border border-blue-200/50 group">
              <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold">#15</Badge>
              <div>
                <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">SIGN DOCUMENT</p>
                <p className="text-sm text-gray-600">0xd3f24e...6a226a80</p>
              </div>
            </a>
          </div>
          <div className="mt-6 text-center">
            <Link href="/schemas" className="inline-flex items-center px-6 py-3 bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 font-semibold rounded-xl border border-blue-200/50 transition-all duration-200 hover:scale-105" prefetch={false}>
              View all schemas
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}