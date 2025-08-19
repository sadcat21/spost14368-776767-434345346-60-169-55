import React from 'react';
import { BatchImageGenerator } from '@/components/BatchImageGenerator';
import { GeminiApiKeyPrompt } from '@/components/GeminiApiKeyPrompt';
import { useGeminiApiKey } from '@/hooks/useGeminiApiKey';

export default function BatchImageGenerationPage() {
  const { apiKey, hasApiKey, saveApiKey } = useGeminiApiKey();

  if (!hasApiKey()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <GeminiApiKeyPrompt
          onApiKeySet={saveApiKey}
          currentApiKey={apiKey}
          autoFocus={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <BatchImageGenerator />
    </div>
  );
}