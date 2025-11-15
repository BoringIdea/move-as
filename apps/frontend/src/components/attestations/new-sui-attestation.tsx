"use client"

import { useState, useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import Link from 'next/link'
import { getAttestationRegistryId, getPackageId, Codec, SchemaField, Network } from "@moveas/sdk"
import { Transaction } from "@mysten/sui/transactions"
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils"
import { getExplorerTxUrl } from "@/utils"
import { useCurrentWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { AlertDialog, Flex } from "@radix-ui/themes"
import { Loader2 } from "lucide-react"
import { Chain } from "@/components/providers/chain-provider"
import { getNetwork } from "@/utils/utils"

export function NewSuiAttestation({chain, schema }: { chain: Chain, schema: any }) {
  const network = getNetwork();

  
  const { isConnected } = useCurrentWallet();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState('');
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
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="border border-black bg-[#F4F7FF] px-6 py-5 space-y-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/60">Schema Attestation</p>
              <h1 className="text-3xl font-black">Create a new attestation</h1>
              <p className="text-sm font-bold text-black/60">Issue a signed statement based on schema #{schema.id}.</p>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/40 break-all">{schema.address}</p>
            </div>
            <div className="text-right space-y-1 text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/40">
              <span>{chain.toUpperCase()} network</span>
              <span>{schemaItem.length} fields</span>
            </div>
          </div>
        </section>

        <section className="border border-black bg-white px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Schema Fields</p>
              <p className="text-xs font-bold text-black/50">Fill each field exactly as defined by the schema.</p>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/40">Required</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {schemaItem.map((field: SchemaField, index: number) => (
              <div key={index} className="border border-black px-4 py-3 space-y-2">
                <Label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-black/60 flex items-center gap-2">
                  <span className="px-2 py-[2px] border border-black text-[0.6rem] font-black tracking-[0.3em]">{field.type}</span>
                  {field.name}
                </Label>
                <Input
                  type="text"
                  placeholder={`Enter ${field.name} (${field.type})`}
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="border border-black bg-white px-5 py-5 space-y-4">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Basic Information</p>
            <p className="text-xs font-bold text-black/50">Recipient and metadata for this attestation.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Recipient Address</Label>
              <Input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Name</Label>
              <Input
                type="text"
                placeholder="Attestation name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Description</Label>
              <Input
                type="text"
                placeholder="Attestation description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section className="border border-black bg-white px-5 py-5 space-y-4">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Advanced Options</p>
            <p className="text-xs font-bold text-black/50">Set optional metadata and type preferences.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Expiration Time</Label>
              <Input
                type="datetime-local"
                value={expirationTime}
                onChange={(e) => setExpirationTime(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Reference Attestation ID</Label>
              <Input
                type="text"
                placeholder="0x..."
                value={refAttestationId}
                onChange={(e) => setRefAttestationId(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Resolver Module</Label>
              <Input
                type="text"
                placeholder="Resolver module address"
                value={resolverModule}
                onChange={(e) => setResolverModule(e.target.value)}
                className="w-full h-12 px-3 border border-black text-sm font-semibold uppercase tracking-[0.1em] focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">Attestation Type</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="flex-1 h-12 border border-black bg-white/70 text-black/40 font-black uppercase tracking-[0.3em]"
              >
                Off-chain (coming soon)
              </button>
              <button
                type="button"
                onClick={() => handleButtonClick('onchain')}
                className={`flex-1 h-12 border border-black font-black uppercase tracking-[0.3em] transition ${selectedButton === 'onchain' ? 'bg-[#2792FF] text-white' : 'bg-white text-black'}`}
              >
                On-chain
              </button>
            </div>
          </div>
        </section>

        <section className="border border-black bg-[#F4F7FF] px-5 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="revocable"
              checked={isRevocable}
              onChange={handleRevocableChange}
              className="w-4 h-4 border border-black"
            />
            <Label htmlFor="revocable" className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-black/60">
              Make this attestation revocable
            </Label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Link
              href="/schemas"
              className="border border-black px-4 py-2 text-xs font-black uppercase tracking-[0.3em]"
            >
              ← Back to Schemas
            </Link>
            <button
              type="button"
              onClick={handleCreateAttestation}
              disabled={isLoading || !isConnected}
              className="flex items-center justify-center gap-2 border border-black bg-[#2792FF] text-white px-5 py-2 text-xs font-black uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Attestation'
              )}
            </button>
          </div>
        </section>
      </main>

      {digest && (
        <section className="max-w-6xl mx-auto px-4 py-5 space-y-3 border border-black bg-[#F4FFF9]">
          <div className="flex items-center justify-between text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/50">
            <span>Attestation created</span>
            <span>Transaction hash</span>
          </div>
          <p className="text-sm font-black text-black break-all">{digest}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${getExplorerTxUrl(chain)}/${digest}`}
              target="_blank"
              rel="noreferrer"
              className="border border-black px-4 py-2 text-xs font-black uppercase tracking-[0.3em]"
            >
              View on explorer
            </a>
            <Link
              href="/attestations"
              className="border border-black px-4 py-2 text-xs font-black uppercase tracking-[0.3em]"
            >
              View all attestations
            </Link>
          </div>
        </section>
      )}

      <AlertDialog.Root open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialog.Content className="bg-white border border-black px-6 py-5 max-w-md mx-auto">
          <AlertDialog.Title className="text-lg font-black text-black mb-2">
            {alertMessage.includes('successfully') ? 'Success' : 'Notice'}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-black/70 mb-4 whitespace-pre-wrap">
            {alertMessage}
          </AlertDialog.Description>
          <Flex gap="3" justify="end">
            <AlertDialog.Cancel>
              <button className="px-4 py-2 border border-black text-xs font-black uppercase tracking-[0.3em]">Close</button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  )
}
