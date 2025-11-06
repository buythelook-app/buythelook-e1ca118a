
'use client';

import React, { useState } from "react";
import { runFullRecommendation } from "@/simulation/runFullRecommendation";
import { useToast } from "@/hooks/use-toast";

export default function RecommendLookButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState<any>(null);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await runFullRecommendation(userId);
      if (result.success) {
        setOutfit(result.data);
      } else {
        toast({
          title: "Recommendation failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Unexpected error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Generating Look..." : "Recommend Me a Look"}
      </button>

      {outfit && (
        <div className="bg-white border rounded p-4 space-y-2 shadow">
          <h3 className="font-bold text-lg">✨ Your Look</h3>
          <div>👕 Top: {outfit.top?.product_name}</div>
          <div>👖 Bottom: {outfit.bottom?.product_name}</div>
          <div>👞 Shoes: {outfit.shoes?.product_name}</div>
          {outfit.tips && (
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {outfit.tips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
