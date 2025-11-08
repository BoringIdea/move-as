"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCurrentWallet, useSignAndExecuteTransaction, useSuiClientContext, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from "@mysten/sui/transactions";
import { getSchemaRegistryId, getPackageId, Network } from "@moveas/sdk"
import { Header } from "@/components/header"
import { bcs } from "@mysten/bcs"
import { getNetwork, getExplorerUrl, getExplorerTxUrl } from "@/utils"
import { AlertDialog, Flex } from "@radix-ui/themes"
import { Loader2 } from "lucide-react"
import { useSchemas, useAttestations } from '@/api';
import { useChain, Chain } from "@/components/providers/chain-provider";

interface Field {
  name: string;
  type: string;
  array: boolean;
}

export function CreateSuiSchema({chain}: {chain: Chain}) {
  const network = getNetwork();
  
  // const { mutate: mutateSchemas } = useSchemas(chain, getNetwork());
  // const { mutate: mutateAttestations } = useAttestations(chain, getNetwork());

  const { isConnected, currentWallet, connectionStatus } = useCurrentWallet();
  const currentAccount = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState('');
  const [fields, setFields] = useState<Field[]>([{ name: "", type: "", array: false }])
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [isRevocable, setIsRevocable] = useState(false)
  const [resolver, setResolver] = useState("")

  useEffect(() => {
    if (!isConnected) return;
  }, [isConnected])

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "", array: false }])
  }
  const handleFieldChange = (index: number, field: keyof Field, value: string | boolean) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [field]: value }
    setFields(newFields)
  }
  const isFormValid = () => {
    return fields.some((field) => field.name && field.type)
  }

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleMoveCall(fields: Field[], revokable: boolean) {
    setIsLoading(true);
    const schemaString = fields.map(field => {
      let typeString = field.type;
      if (field.array) {
        typeString = `Vector<${field.type}>`;
      }
      return `${field.name}: ${typeString}`;
    }).join(', ');

    const schemaBytes = bcs.string().serialize(schemaString).toBytes();

    if (!isConnected || !currentWallet || !currentAccount) {
      return Error('Please connect wallet')
    }

    const schemaRegistryId = getSchemaRegistryId(chain, network as Network);
    const packageId = getPackageId(chain, network as Network);
    const tx = new Transaction();

    console.log('current network', network)
    console.log('packageId', packageId)
    console.log('schemaRegistryID', schemaRegistryId)

    if (resolver) {
      console.log('create schema with resolver', resolver)
      const [resolverBuilder, adminCap, schemaRecord] = tx.moveCall({
        target: `${packageId}::schema::new_with_resolver`,
        arguments: [
          tx.object(schemaRegistryId),
          tx.pure.vector('u8', schemaBytes),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(url),
          tx.pure.bool(revokable)
        ],
      });
  
      tx.transferObjects([adminCap], currentAccount.address);
      
      tx.moveCall({
        target: `${resolver}::add`,
        arguments: [
          schemaRecord,
          resolverBuilder, 
        ],
      });
      
      tx.moveCall({
        target: `${packageId}::schema::add_resolver`,
        arguments: [
          schemaRecord,
          resolverBuilder,
        ],
      });
  
      tx.moveCall({
        target: `${packageId}::schema::share_schema`,
        arguments: [
          schemaRecord,
        ],
      });
    } else {
      console.log('create schema without resolver')
      const adminCap = tx.moveCall({
        target: `${packageId}::schema::new`,
        arguments: [
          tx.object(schemaRegistryId),
          tx.pure.vector('u8', schemaBytes),
          tx.pure.string(name || ""),
          tx.pure.string(description || ""),
          tx.pure.string(url || ""),
          tx.pure.bool(revokable)
        ],
      });
  
      tx.transferObjects([adminCap], currentAccount.address);
    }

    try {
      signAndExecuteTransaction({
        transaction: tx as any,
      }, {
        onSuccess: async (result) => {
          console.log('executed transaction', result);
          setDigest(result.digest);
          const txUrl = `${getExplorerTxUrl(chain)}/${result.digest}`;
          setAlertMessage(`Transaction submitted successfully!\n\nTransaction hash: ${result.digest}`);
          setIsAlertOpen(true);
          setIsLoading(false);

          // refetch schemas and attestations
          // await mutateSchemas();
          // await mutateAttestations();
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
      console.error('Transaction failed:', error);

      let errorMessage = 'Transaction failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Transaction failed: ${error.message}`;
      }
      setAlertMessage(errorMessage);
      setIsAlertOpen(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight mb-4">
            Create a Schema
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-3xl mx-auto">
            Design and deploy custom attestation schemas for your specific use case
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/30">
          <CardHeader className="p-8 border-b border-blue-100/30">
            <CardTitle className="text-3xl font-bold text-gray-800">Schema Configuration</CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Add fields below that are relevant to your use case. Each field will define the structure of your attestation schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Schema Fields */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Schema Fields</h3>
              {fields.map((field, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                  <div>
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">Field Name</Label>
                    <Input
                      placeholder="Enter field name"
                      value={field.name}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => handleFieldChange(index, "type", value)}
                    >
                      <SelectTrigger className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="u8">u8</SelectItem>
                        <SelectItem value="u16">u16</SelectItem>
                        <SelectItem value="u32">u32</SelectItem>
                        <SelectItem value="u64">u64</SelectItem>
                        <SelectItem value="u128">u128</SelectItem>
                        <SelectItem value="u256">u256</SelectItem>
                        <SelectItem value="bool">Bool</SelectItem>
                        <SelectItem value="String">String</SelectItem>
                        <SelectItem value="address">Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.array}
                      onCheckedChange={(checked) => handleFieldChange(index, "array", checked)}
                      className="border-blue-200/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label className="text-sm font-medium text-blue-700">Array Type</Label>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={handleAddField}
                className="w-full md:w-auto bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 border-blue-200/50 hover:border-blue-300/50 rounded-xl px-6 py-3 font-semibold transition-all duration-200"
              >
                + Add Field
              </Button>
            </div>

            {/* Schema Metadata */}
            <div className="space-y-6 pt-6 border-t border-blue-100/30">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Schema Metadata</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-sm font-medium text-blue-700">Name (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="Set the name of the schema"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700">URL (Optional)</Label>
                  <Input
                    placeholder="Set the URL of the schema"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Description (Optional)</Label>
                <Input
                  placeholder="Set the description of the schema"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Resolver Module (Optional)</Label>
                <p className="text-sm text-gray-600">
                  Optional smart contract that gets executed with every attestation of this type. Can be used to verify,
                  limit, or act upon any attestation.
                </p>
                <Input
                  placeholder="ex: 0x0000000000000000000000000000000000000001::blocklist"
                  value={resolver}
                  onChange={(e) => setResolver(e.target.value)}
                  className="border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-blue-700">Revocable</Label>
                <p className="text-sm text-gray-600">Determine if attestations of this schema can be revoked</p>
                <div className="flex space-x-4">
                  <Button 
                    variant={isRevocable === true ? "default" : "outline"} 
                    onClick={() => setIsRevocable(true)}
                    className={isRevocable === true 
                      ? "bg-blue-500 hover:bg-blue-600 text-white" 
                      : "bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 border-blue-200/50 hover:border-blue-300/50"
                    }
                  >
                    Yes
                  </Button>
                  <Button 
                    variant={isRevocable === false ? "default" : "outline"} 
                    onClick={() => setIsRevocable(false)}
                    className={isRevocable === false 
                      ? "bg-blue-500 hover:bg-blue-600 text-white" 
                      : "bg-blue-50/70 hover:bg-blue-100/70 text-blue-600 border-blue-200/50 hover:border-blue-300/50"
                    }
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 border-t border-blue-100/30">
            <Button
              disabled={!isFormValid() || !isConnected || isLoading}
              onClick={async () => {
                try {
                  await handleMoveCall(fields, isRevocable);
                } catch (error) {
                  console.error('Transaction failed:', error);
                }
              }}
              className="w-full md:w-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create Schema'
              )}
            </Button>
          </CardFooter>
        </Card>

        <AlertDialog.Root open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialog.Content className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50">
            <AlertDialog.Title className="text-2xl font-bold text-gray-800">Transaction Result</AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mt-2">
              {alertMessage}
            </AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="outline" className="bg-gray-50/70 hover:bg-gray-100/70 text-gray-600 border-gray-200/50 hover:border-gray-300/50 rounded-lg">
                  Close
                </Button>
              </AlertDialog.Cancel>
              {digest && (
                <AlertDialog.Action>
                  <Button 
                    onClick={() => window.open(`${getExplorerTxUrl(chain)}/${digest}`, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    View Transaction
                  </Button>
                </AlertDialog.Action>
              )}
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </main>
    </div>
  )
}