
'use client';

import React, { useState } from "react";
import { runFullRecommendation } from "@/simulation/runFullRecommendation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RunRecommendationButton() {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const output = await runFullRecommendation(userId);
      setResult(output);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-sm max-w-md">
      <Label className="block mb-2 font-medium">Enter user ID:</Label>
      <Input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="e.g. user1"
        className="p-2 border w-full rounded mb-4"
      />
      <Button
        onClick={handleRun}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Running..." : "Run Full Recommendation"}
      </Button>

      {result && (
        <pre className="mt-4 p-2 bg-gray-100 text-sm rounded overflow-x-auto max-h-80">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
