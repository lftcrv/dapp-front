# Starknet Account Deployment Fix

This document explains the changes made to fix the Starknet account deployment issue.

## Key Changes

1. **Updated Contract Class Hash**
   - Changed the OpenZeppelin account class hash to the correct value for Sepolia network:
   - Old: `0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f`
   - New: `0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f`

2. **Fixed Constructor Calldata Format**
   - Changed the constructor calldata format to match the expected format for the account contract:
   ```typescript
   // Old format
   const constructorCalldata = CallData.compile({
     implementation: OZ_ACCOUNT_CLASS_HASH,
     selector: hash.getSelectorFromName('initialize'),
     calldata: [pubKeyFelt, 0] // [publicKey, guardianAddress = 0]
   });

   // New format
   const constructorCalldata = CallData.compile({
     publicKey: pubKeyFelt,
   });
   ```

3. **Direct Account Deployment**
   - Changed to deploy the account directly instead of using a proxy:
   ```typescript
   // Old
   const deployAccountPayload = {
     classHash: OZ_PROXY_CLASS_HASH,
     constructorCalldata,
     addressSalt: pubKeyFelt
   };

   // New
   const deployAccountPayload = {
     classHash: OZ_ACCOUNT_CLASS_HASH,
     constructorCalldata,
     addressSalt: pubKeyFelt
   };
   ```

4. **Fixed maxFee Parameter**
   - Updated the maxFee parameter to be passed as a string:
   ```typescript
   // Old
   const { transaction_hash: deployTxHash } = await account.deployAccount({
     ...deployAccountPayload,
     maxFee
   });

   // New
   const { transaction_hash: deployTxHash } = await account.deployAccount({
     ...deployAccountPayload,
     maxFee: maxFee.toString()
   });
   ```

## Testing the Deployment

1. **Using the Test Script**
   ```bash
   node scripts/test-starknet-deployment.js
   ```
   This script will:
   - Connect to the Starknet Sepolia network
   - Check if the account is already deployed
   - Calculate the expected address using the correct parameters
   - Compare with the target address

2. **Using the Debug Tools**
   - Open the application in your browser
   - Connect with your wallet
   - If deployment fails, use the debug tools to see the error
   - Click "Retry Deployment" to attempt again with the fixed parameters

## Common Issues

1. **Entry Point Not Found Error**
   - This error occurs when using an incorrect class hash or constructor calldata format
   - Solution: Use the correct class hash for the network and the proper constructor calldata format

2. **Fee Estimation Error**
   - This can occur if the maxFee parameter is not properly formatted
   - Solution: Pass the maxFee as a string value

3. **Public Key Size Issues**
   - If the public key is too large, it needs to be adjusted using modulo with the curve order
   - Solution: Apply modulo with the Starknet curve order to ensure the key is valid

## Verifying Deployment

To verify if an account is deployed:
```javascript
const provider = new RpcProvider({ nodeUrl: NODE_URL });
try {
  const accountClassHash = await provider.getClassHashAt(accountAddress);
  console.log('Account deployed with class hash:', accountClassHash);
} catch (error) {
  console.log('Account not deployed');
}
```

## References

- [Starknet.js Documentation](https://www.starknetjs.com/docs/API/account)
- [OpenZeppelin Account Contracts](https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/account)
- [Starknet Sepolia Explorer](https://sepolia.starkscan.co/) 