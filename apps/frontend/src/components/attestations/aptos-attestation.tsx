import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Codec } from "@moveas/sdk";
import { bcs } from "@mysten/bcs";
import { useSuiClientContext } from "@mysten/dapp-kit";
import { getExplorerUrl, getExplorerTxUrl } from "@/utils/utils";
import { useChain, Chain } from "@/components/providers/chain-provider";
import { Hex } from "@aptos-labs/ts-sdk";

export function AptosAttestation(
  { chain, attestation }
    : { chain: Chain, attestation: any }) {


  const schema = bcs.string().parse(Hex.fromHexString(attestation.schema_data).toUint8Array());

  const codec = new Codec(schema);
  const item = codec.schemaItem();

  const decoded = codec.decodeFromBytes(Hex.fromHexString(attestation.data).toUint8Array());

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight mb-4">
            Onchain Attestation
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            View detailed information about this attestation
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">UID:</div>
                  <a href={`${getExplorerUrl(chain)}/object/${attestation.address}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all">
                    {attestation.address}
                  </a>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">SCHEMA:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-indigo-100/70 text-indigo-700 border-indigo-200/50 font-semibold px-3 py-1 rounded-lg">
                      {attestation.schema_name}
                    </Badge>
                    <a href={`/schema/${attestation.schema_address}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all">
                      {attestation.schema_address}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">Created:</div>
                  <div className="text-gray-800 font-medium">{new Date(Number(attestation.time * 1000)).toUTCString()}</div>
                </div>
                
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">Revocable:</div>
                  <div className="text-gray-800 font-medium">{attestation.revocable ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">Expiration:</div>
                <div className="text-gray-800 font-medium">{attestation.expiration_time != '0' ? new Date(Number(attestation.expiration_time * 1000)).toUTCString() : "Never"}</div>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">Revoked:</div>
                <div className="text-gray-800 font-medium">{attestation.revocation_time != '0' ? new Date(Number(attestation.revocation_time * 1000)).toUTCString() : "No"}</div>
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Participants</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">From (Attestor):</div>
                <a href={`/address/${attestation.attestor}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all">
                  {attestation.attestor}
                </a>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">To (Recipient):</div>
                <a href={`/address/${attestation.recipient}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all">
                  {attestation.recipient}
                </a>
              </div>
            </div>
          </div>

          {/* Decoded Data Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Decoded Data</h2>
            
            <div className="space-y-4">
              {item.map((field: any, index: any) => (
                <div key={index} className="flex flex-col md:flex-row items-stretch rounded-xl overflow-hidden shadow-sm border border-blue-100/50">
                  <div className="p-4 flex flex-col justify-center w-full md:w-1/4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <span className="text-xs uppercase opacity-90 font-medium">{field.type}</span>
                    <span className="font-bold text-sm">{field.name}</span>
                  </div>
                  <div className="text-gray-800 p-4 flex items-center w-full md:w-3/4 text-left break-all bg-blue-50/50">
                    <span className="text-sm font-medium">{formatValue(decoded[field.name])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Information Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction Information</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">Transaction ID:</div>
                <a href={`${getExplorerTxUrl(chain)}/${attestation.tx_hash || ''}`} className="font-mono text-blue-600 hover:text-blue-700 transition-colors duration-200 break-all">
                  {attestation.tx_hash || 'N/A'}
                </a>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">Referenced Attestation:</div>
                <div className="text-gray-800 font-medium">
                  {attestation.ref_attestation != '0x0' ? attestation.ref_attestation : 'No reference'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-2">Referencing Attestations:</div>
                <div className="text-gray-800 font-medium">{attestation.ref_cnt || 0}</div>
              </div>
            </div>
          </div>

          {/* Raw Data Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Raw Data</h2>
            
            <div className="bg-gray-50/70 p-6 min-h-[8em] whitespace-pre-wrap break-words rounded-xl border border-gray-200/50 font-mono text-sm text-gray-700">
              {attestation.data}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}