# Starknet Deployment Troubleshooting Guide

This guide provides detailed information on troubleshooting and fixing Starknet account deployment issues.

## Common Deployment Issues

### 1. Entry Point Not Found Error

**Error Message:**
```
Error during account deployment: Error: Execution error: Entry point 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad is not found in contract
```

**Causes:**
- Incorrect contract class hash
- Wrong constructor calldata format
- Using a proxy contract when direct deployment is needed

**Solutions:**
- Use the correct OpenZeppelin account class hash for your network:
  - Sepolia: `0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f`
  - Mainnet: `0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c`

- Format constructor calldata correctly:
```typescript
// Correct format for direct account deployment
const constructorCalldata = CallData.compile({
  publicKey: pubKeyFelt,
});
```

### 2. Public Key Size Issues

**Error Message:**
```
Warning: Public key is too large, applying modulo with curve order
```

**Causes:**
- The public key exceeds the Starknet curve order
- Incorrect key derivation process

**Solutions:**
- Apply modulo with the Starknet curve order:
```typescript
const STARKNET_CURVE_ORDER = '0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f';
const pubKeyBigInt = BigInt(pubKey);
const curveOrderBigInt = BigInt(STARKNET_CURVE_ORDER);
const adjustedPubKey = '0x' + (pubKeyBigInt % curveOrderBigInt).toString(16);
```

### 3. Fee Estimation Failures

**Error Message:**
```
Error during account deployment: Error: Execution error: Fee estimation failed
```

**Causes:**
- Insufficient max fee
- Incorrect fee format
- Network congestion

**Solutions:**
- Set a higher max fee (0.001 ETH is recommended):
```typescript
const maxFee = 1000000000000000n; // 0.001 ETH
```

- Pass the fee as a string:
```typescript
await account.deployAccount({
  ...deployAccountPayload,
  maxFee: maxFee.toString() // Convert BigInt to string
});
```

## Debugging Tools

### Browser Console Commands

The following debug utilities are available in the browser console:

```javascript
// View all deployment attempts
window.listStarknetDeployments();

// View details for a specific address
window.debugStarknetDeployment('0x123...abc');

// Clear deployment data for an address
window.clearStarknetDeploymentData('0x123...abc');

// Reset attempt counter
window.resetStarknetDeploymentAttempts('0x123...abc');
```

### UI Debug Tools

The application includes a debug panel that can be accessed when deployment fails:

1. **View Deployment Data**: Shows all stored deployment attempts
2. **Clear Data**: Removes stored deployment data for the current address
3. **Reset Attempts**: Resets the attempt counter to allow more deployment tries
4. **Retry Deployment**: Clears data and reloads the page for a fresh attempt

## Deployment Process

The correct deployment process involves:

1. **Key Derivation**:
   - Generate a Starknet key pair
   - Ensure the public key is within the valid range

2. **Address Calculation**:
   - Use the correct class hash
   - Format constructor calldata properly
   - Calculate the pre-computed address

3. **Deployment**:
   - Set an appropriate max fee
   - Handle deployment errors gracefully
   - Return the pre-computed address even if deployment fails

## Testing Deployment

Use the test script to verify your deployment parameters:

```bash
node scripts/test-starknet-deployment.js
```

This script will:
- Connect to the Starknet network
- Calculate the expected address using your parameters
- Compare with the target address
- Verify if the account is already deployed

## References

- [Starknet.js Documentation](https://www.starknetjs.com/docs/API/account)
- [OpenZeppelin Account Contracts](https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/account)
- [Starknet Curve Order](https://docs.starknet.io/documentation/architecture_and_concepts/Cryptography/stark-curve/)
- [Starknet Fee Mechanism](https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/fee-mechanism/) 