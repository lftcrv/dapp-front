'use client';

import { useState } from 'react';
import { StarknetTokenApproval } from '@/components/starknet-token-approval';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

/**
 * Example of how to integrate the StarknetTokenApproval component
 * into the create-agent page flow.
 * 
 * This is just an example and not meant to be used directly.
 */
export function AgentCreationWithApproval() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  
  // Constants that would normally come from environment variables
  const AGENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS || '0x01e2F67d8132831f210E19c5Ee0197aA134308e16F7f284bBa2c72E28FC464D2';
  const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
  const APPROVAL_AMOUNT = '1000000000000000000'; // 1 ETH in wei
  
  // This would be the actual deployment function
  const handleDeploy = async () => {
    if (!isApproved) {
      showToast('DEFAULT_ERROR', 'error', 'Token approval required before creating agent');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate deployment process
      showToast('TX_PENDING', 'loading');
      
      // In a real implementation, this would call your deployment function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('TX_SUCCESS', 'success');
      setIsSubmitting(false);
      
      // Redirect or show success message
    } catch (error) {
      console.error('❌ Deployment error:', error);
      showToast('TX_ERROR', 'error');
      setIsSubmitting(false);
    }
  };
  
  // Handle successful approval
  const handleApprovalSuccess = (approvalTxHash?: string) => {
    setIsApproved(true);
    setTxHash(approvalTxHash);
    
    // Optionally auto-trigger deployment after approval
    // handleDeploy();
  };
  
  // Handle approval error
  const handleApprovalError = (error: string) => {
    console.error('❌ Approval error:', error);
    setIsApproved(false);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Create Agent</h2>
      
      {/* Form fields would go here */}
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {!isApproved ? (
          <StarknetTokenApproval
            spenderAddress={AGENT_CONTRACT_ADDRESS}
            tokenAddress={ETH_TOKEN_ADDRESS}
            tokenAmount={APPROVAL_AMOUNT}
            onSuccess={handleApprovalSuccess}
            onError={handleApprovalError}
            buttonText="Approve Agent Creation"
            className="w-full sm:w-auto"
          />
        ) : (
          <Button
            onClick={handleDeploy}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Creating Agent...' : 'Create Agent'}
          </Button>
        )}
      </div>
      
      {isApproved && txHash && (
        <p className="text-sm text-green-600">
          ✅ Tokens approved! Transaction: {txHash.slice(0, 10)}...{txHash.slice(-6)}
        </p>
      )}
    </div>
  );
} 