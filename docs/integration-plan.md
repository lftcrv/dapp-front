# Integration Plan: Token Approval for Agent Creation

## What We've Built

1. **Server Actions for Token Approval**
   - `starknet-transactions.ts`: Handles token approvals for both EVM-derived and native Starknet wallets
   - Includes functions for checking balances, preparing transactions, and executing approvals

2. **Client Component for Token Approval**
   - `starknet-token-approval.tsx`: A reusable button component that handles the approval process
   - Supports both wallet types and provides callbacks for success/error handling

3. **Example Integration**
   - `examples/agent-approval-integration.tsx`: Shows how to integrate the approval flow into a page
   - Demonstrates the two-step process: approve tokens first, then create agent

4. **Documentation**
   - `docs/starknet-approval.md`: Explains the implementation and usage

## Integration Plan for Create Agent Page

### Step 1: Modify the Create Agent Page

1. Import the `StarknetTokenApproval` component:
   ```tsx
   import { StarknetTokenApproval } from '@/components/starknet-token-approval';
   ```

2. Add state for tracking approval status:
   ```tsx
   const [isApproved, setIsApproved] = useState(false);
   ```

3. Define constants for approval:
   ```tsx
   const AGENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS || '0x01e2F67d8132831f210E19c5Ee0197aA134308e16F7f284bBa2c72E28FC464D2';
   const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
   const APPROVAL_AMOUNT = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES || '1000000000000000000';
   ```

4. Add callback functions for approval:
   ```tsx
   const handleApprovalSuccess = () => {
     setIsApproved(true);
   };
   
   const handleApprovalError = (error: string) => {
     console.error('❌ Approval error:', error);
     setIsApproved(false);
   };
   ```

### Step 2: Update the UI

1. Modify the submit button section to show either the approval button or the deploy button:
   ```tsx
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
   ```

### Step 3: Update the Deploy Function

1. Modify the `handleDeploy` function to check for approval:
   ```tsx
   const handleDeploy = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!isApproved) {
       showToast('DEFAULT_ERROR', 'error', 'Token approval required before creating agent');
       return;
     }
     
     // Rest of the existing deployment logic
     // ...
   };
   ```

### Step 4: Testing

1. Test with an EVM wallet:
   - Connect with an EVM wallet
   - Verify that the approval process works without requiring additional signatures
   - Verify that the agent creation works after approval

2. Test with a Starknet wallet:
   - Connect with a Starknet wallet
   - Verify that the approval process prompts the user to sign the transaction
   - Verify that the agent creation works after approval

### Step 5: Monitoring and Logging

1. Add additional logging to track the approval process:
   ```tsx
   console.log('🔄 Agent creation flow:', {
     isApproved,
     walletType: activeWalletType,
     address: currentAddress,
   });
   ```

2. Monitor for any errors or issues in production

## Fallback Plan

If there are issues with the approval process, we can implement a fallback:

1. Add a skip option for users who encounter issues:
   ```tsx
   <Button
     variant="outline"
     onClick={() => setIsApproved(true)}
     className="text-sm"
   >
     Skip approval (not recommended)
   </Button>
   ```

2. Add more detailed error messages to help users troubleshoot issues 