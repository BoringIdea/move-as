'use client'
import { SearchSchema } from "@/components/schemas/search-schema";
import { useChain, Chain } from "@/components/providers/chain-provider";

export default function CreateSchemaPage() {
  const { currentChain } = useChain();
  return (
    <div className="flex justify-center items-center min-h-screen">
        <SearchSchema chain={currentChain} />
    </div>
  )
}