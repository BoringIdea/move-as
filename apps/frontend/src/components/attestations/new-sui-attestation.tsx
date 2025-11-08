"use client"

import { useState, useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import Link from 'next/link'
import { getAttestationRegistryId, getPackageId, Codec, SchemaField, Network } from "@moveas/sdk"
import { Transaction } from "@mysten/sui/transactions"
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils"
import { getExplorerTxUrl } from "@/utils"
import { useCurrentWallet, useSignAndExecuteTransaction, useSuiClientContext } from '@mysten/dapp-kit';
import { AlertDialog, Flex } from "@radix-ui/themes"
import { Loader2 } from "lucide-react"
import { useSchemas, useAttestations } from '@/api';
import { useChain, Chain } from "@/components/providers/chain-provider"
import { getNetwork } from "@/utils/utils"

export function NewSuiAttestation({chain, schema }: { chain: Chain, schema: any }) {
  const network = getNetwork();

  // const { mutate: mutateSchemas } = useSchemas(chain, network);
  // const { mutate: mutateAttestations } = useAttestations(chain, network);
  
  const { isConnected, currentWallet, connectionStatus } = useCurrentWallet();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedButton, setSelectedButton] = useState("onchain")

  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({})

  const [recipient, setRecipient] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [expirationTime, setExpirationTime] = useState("")
  const [refAttestationId, setRefAttestationId] = useState("")
  const [isRevocable, setIsRevocable] = useState(false)

  const [resolverModule, setResolverModule] = useState("")

  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Use useMemo to avoid recreating these objects on every render
  const codec = useMemo(() => new Codec(schema.schema), [schema.schema]);
  const schemaItem = useMemo(() => codec.schemaItem(), [codec]);

  useEffect(() => {
    if (schema && schema.schema && schemaItem) {
      const initialValues = schemaItem.reduce((acc: any, field: SchemaField) => {
        acc[field.name] = ''
        return acc
      }, {})
      setFieldValues(initialValues)
    }
  }, [schema, schemaItem])

  const handleInputChange = (name: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [name]: value }))
  }

  const handleButtonClick = (button: any) => {
    setSelectedButton(button)
  }
  const handleRevocableChange = () => {
    setIsRevocable(!isRevocable)
  }

  const handleCreateAttestation = async () => {
    if (!isConnected) {
      alert("Please connect wallet first!")
      return;
    }

    setIsLoading(true);

    const attestationData: { [key: string]: string | number | number[] | bigint | bigint[] } = {};

    for (const [key, value] of Object.entries(fieldValues)) {
      const field = schemaItem.find(f => f.name === key);
      if (field) {
        if (field.type === 'u64') {
          attestationData[key] = BigInt(value);
        } else if (['u8', 'u16', 'u32'].includes(field.type)) {
          attestationData[key] = parseInt(value, 10);
        } else if (field.type.startsWith('Vector')) {
          try {
            const arrayValue = JSON.parse(value.replace(/\s/g, ''));
            if (Array.isArray(arrayValue)) {
              if (field.vectorType === 'u64') {
                attestationData[key] = arrayValue.map(BigInt);
              } else if (['u8', 'u16', 'u32'].includes(field.vectorType || "")) {
                attestationData[key] = arrayValue.map(v => parseInt(v, 10));
              } else {
                attestationData[key] = arrayValue.map(v => v);
              }
            } else {
              throw new Error('Invalide Array format');
            }
          } catch (error) {
            console.error(`Decode ${key} failed:`, error);
          }
        } else {
          attestationData[key] = value;
        }
      }
    }

    try {
      const packageId = getPackageId(chain, network as Network);
      const attestationRegistryId = getAttestationRegistryId(chain, network as Network);
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::attestation::create_attestation`,
        arguments: [
          tx.object(attestationRegistryId),
          tx.object(SUI_CLOCK_OBJECT_ID),
          tx.pure(schema.id),
          tx.pure.address(recipient),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(url),
          tx.pure.u64(expirationTime),
          tx.pure.address(refAttestationId),
          tx.pure.bool(isRevocable),
          tx.pure.bool(selectedButton === "onchain"),
          tx.pure.string(resolverModule),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(JSON.stringify(attestationData))))
        ]
      });

      signAndExecuteTransaction({
        transaction: tx as any,
      }, {
        onSuccess: async (result) => {
          console.log('executed transaction', result);
          setDigest(result.digest);
          setAlertMessage(`Transaction submitted successfully!\n\nTransaction hash: ${result.digest}`);
          setIsAlertOpen(true);
          setIsLoading(false);
          // mutateAttestations();
          // mutateSchemas();
        },
        onError: (error) => {
          console.error('Transaction failed:', error);
          let errorMessage = 'Transaction failed. Please try again.';
          if (error instanceof Error) {
            errorMessage = `Transaction failed: ${error.message}`;
          }
          setAlertMessage(errorMessage);
          setIsAlertOpen(true);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Error creating attestation:', error);
      setAlertMessage('Error creating attestation. Please check your input and try again.');
      setIsAlertOpen(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-8 p-4 md:gap-10 md:p-8 lg:p-12 relative z-0">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100/30">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
              Create Attestation
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl">
              Create a new attestation using schema #{schema.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100/70 to-blue-200/70 rounded-xl">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-semibold">Schema #{schema.id}</p>
              <p className="text-xs text-gray-500 font-medium">Sui Network</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30 overflow-hidden">
          {/* Form Header */}
          <div className="p-6 md:p-8 border-b border-blue-100/30 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Attestation Details</h2>
            <p className="text-gray-600 font-medium">Fill in the required information to create your attestation</p>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Schema Fields */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-blue-200/50 pb-2">Schema Fields</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {schemaItem.map((field: SchemaField, index: number) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100/50 text-blue-700 text-xs font-bold rounded-lg">
                        {field.type}
                      </span>
                      {field.name}
                    </Label>
                    <Input
                      type="text"
                      placeholder={`Enter ${field.name} (${field.type})`}
                      value={fieldValues[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-blue-200/50 pb-2">Basic Information</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Recipient Address</Label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Name</Label>
                  <Input
                    type="text"
                    placeholder="Attestation name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <Input
                    type="text"
                    placeholder="Attestation description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">URL</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-blue-200/50 pb-2">Advanced Options</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Expiration Time</Label>
                  <Input
                    type="datetime-local"
                    value={expirationTime}
                    onChange={(e) => setExpirationTime(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Reference Attestation ID</Label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={refAttestationId}
                    onChange={(e) => setRefAttestationId(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Resolver Module</Label>
                  <Input
                    type="text"
                    placeholder="Resolver module address"
                    value={resolverModule}
                    onChange={(e) => setResolverModule(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-blue-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Attestation Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled
                      className="flex-1 h-12 px-4 rounded-xl font-semibold bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-60"
                    >
                      Off-chain (Coming Soon)
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleButtonClick("onchain")}
                      className={`flex-1 h-12 px-4 rounded-xl transition-all duration-200 font-semibold ${
                        selectedButton === "onchain"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : "bg-blue-50/70 text-blue-600 border-2 border-blue-200/50 hover:bg-blue-100/70"
                      }`}
                    >
                      On-chain
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Revocable Option */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 rounded-xl border border-blue-200/50">
              <input
                type="checkbox"
                id="revocable"
                checked={isRevocable}
                onChange={handleRevocableChange}
                className="w-5 h-5 text-blue-600 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-200/50"
              />
              <Label htmlFor="revocable" className="text-sm font-semibold text-gray-700">
                Make this attestation revocable
              </Label>
            </div>
          </div>

          {/* Form Footer */}
          <div className="p-6 md:p-8 border-t border-blue-100/30 bg-gradient-to-r from-blue-50/20 to-indigo-50/20">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link
                href="/schemas"
                className="px-6 py-3 text-blue-600 font-semibold rounded-xl border-2 border-blue-200/50 hover:bg-blue-50/70 transition-all duration-200 hover:scale-105"
              >
                ← Back to Schemas
              </Link>
              <Button
                onClick={handleCreateAttestation}
                disabled={isLoading || !isConnected}
                className="px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Attestation'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {digest && (
          <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 p-6 md:p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800">Attestation Created Successfully!</h3>
              <p className="text-green-700 font-medium">Transaction Hash: {digest}</p>
              <div className="flex gap-4 justify-center">
                <a
                  href={`${getExplorerTxUrl(chain)}/${digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  View on Explorer
                </a>
                <Link
                  href="/attestations"
                  className="px-6 py-3 bg-green-50/70 hover:bg-green-100/70 text-green-700 font-semibold rounded-xl border border-green-200/50 transition-all duration-200 hover:scale-105"
                >
                  View All Attestations
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Alert Dialog */}
      <AlertDialog.Root open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialog.Content className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-blue-200/50 p-6 max-w-md mx-auto">
          <AlertDialog.Title className="text-xl font-bold text-gray-800 mb-2">
            {alertMessage.includes('successfully') ? 'Success!' : 'Error'}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-gray-600 mb-6">
            <div className="whitespace-pre-wrap">{alertMessage}</div>
          </AlertDialog.Description>
          <Flex gap="3" justify="end">
            <AlertDialog.Cancel>
              <button className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200">
                Close
              </button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  )
}