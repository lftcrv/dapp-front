'use client';

import { HomePageContent } from '@/components/home-page-content';
import { clearDeploymentData } from '@/actions/shared/derive-starknet-account';
import { useState } from 'react';

export default function HomePage() {
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [debugAddress, setDebugAddress] = useState('');

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <HomePageContent />
      </div>

      {/* Debug tools - hidden by default */}
      <div className="w-full mt-8">
        <button
          onClick={() => setShowDebugTools(!showDebugTools)}
          className="text-xs text-gray-500 underline"
        >
          {showDebugTools ? 'Hide Debug Tools' : 'Show Debug Tools'}
        </button>
        
        {showDebugTools && (
          <div className="mt-4 p-4 border border-gray-300 rounded-md">
            <h3 className="text-sm font-medium mb-2">Debug Tools</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={debugAddress}
                  onChange={(e) => setDebugAddress(e.target.value)}
                  placeholder="Enter EVM address"
                  className="px-3 py-1 border border-gray-300 rounded-md text-xs flex-1"
                />
                <button
                  onClick={() => {
                    if (debugAddress) {
                      clearDeploymentData(debugAddress);
                      alert(`Deployment data cleared for ${debugAddress}. Please refresh the page.`);
                    } else {
                      alert('Please enter an address');
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs"
                >
                  Clear Deployment Data
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Use this to clear deployment data for a specific address if you&apos;re having issues.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
