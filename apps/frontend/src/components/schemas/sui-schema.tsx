import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Codec } from "@moveas/sdk"
import { getExplorerUrl, getNetwork, getExplorerTxUrl } from '@/utils'
import { useChain, Chain } from "@/components/providers/chain-provider";

export default function SuiSchema({ chain, schema }: { chain: Chain, schema: any }) {
  const network = getNetwork();
  const router = useRouter()

  const codec = new Codec(schema.schema);
  const item = codec.schemaItem();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight mb-4">
            Schema Details
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            Explore and understand this attestation schema structure
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Schema Header Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold px-4 py-2 rounded-lg text-lg">
                    #{schema.id}
                  </Badge>
                  <div className='text-2xl font-bold text-gray-800 break-all'>{schema.name}</div>
                </div>
                <div className="break-all">
                  <a href={`${getExplorerUrl(chain)}/object/${schema.address}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200">
                    {schema.address}
                  </a>
                </div>
              </div>
              <div className="w-full lg:w-auto">
                <Button 
                  variant="default" 
                  onClick={() => router.push(`/attestation/create?id=${schema.address}`)}
                  className="w-full lg:w-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  Attest with Schema
                </Button>
              </div>
            </div>
          </div>

          {/* Schema Information Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Schema Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">CREATED:</div>
                  <p className="text-gray-800 font-medium">{new Date(Number(schema.created_at)).toUTCString()}</p>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">CREATOR:</div>
                  <Link
                    href={`/address/${schema.creator}`}
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200 break-all"
                    prefetch={false}
                  >
                    {schema.creator}
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">TRANSACTION ID:</div>
                  <Link
                    href={`${getExplorerTxUrl(chain)}/${schema.tx_hash}`}
                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200 break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    {schema.tx_hash}
                  </Link>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">RESOLVER:</div>
                  <div className="text-gray-800 font-medium">
                    {schema.resolver ? "Yes" : 'No Resolver'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">REVOCABLE ATTESTATIONS:</div>
                  <p className="text-gray-800 font-medium">{schema.revokable ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decoded Schema Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Decoded Schema</h2>
            
            <div className="flex flex-wrap gap-4">
              {item.map((field: any, index: any) => (
                <Badge key={index} variant="secondary" className="p-4 flex flex-col items-center rounded-xl bg-amber-100/70 text-amber-700 border-amber-200/50 min-w-[120px]">
                  <div className="text-xs text-amber-600 text-center font-medium mb-1">{field.type.toUpperCase()}</div>
                  <div className="font-bold text-center">{field.name}</div>
                </Badge>
              ))}
            </div>
          </div>

          {/* Raw Schema Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Raw Schema</h2>
            
            <div className="p-6 border border-gray-200/50 rounded-xl bg-gray-50/70">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 font-mono">{schema.schema}</pre>
            </div>
          </div>

          {/* Attestation Count Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Attestation Count</h2>
            
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-600">
                Total attestations created using this schema
              </p>
              <Link 
                href={`/attestations/${schema.address}`} 
                className="inline-flex items-center px-6 py-3 bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 font-semibold rounded-xl border border-blue-200/50 transition-all duration-200 hover:scale-105"
              >
                {schema.attestation_cnt || 0} Attestations
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}