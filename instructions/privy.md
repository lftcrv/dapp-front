Integrating with wagmi
Wagmi is a set of React hooks for interfacing with Ethereum wallets, allowing you read wallet state, request signatures or transactions, and take read and write actions on the blockchain.

Privy is fully compatible with wagmi, and you can use wagmi's React hooks to interface with external and embedded wallets from Privy. Just follow the steps below!

INFO
This guide describes how to integrate Privy with wagmi version 2.x. If you need to integrate Privy with wagmi version 1.x or below, follow this legacy guide instead.

TIP
Migrating from wagmi version 1.x? Jump to the migration guide below.

Integration steps
This guide assumes you have already integrated Privy into your app. If not, please begin with the Privy Quickstart.

1. Install dependencies
   Install the latest versions of wagmi, @tanstack/react-query, @privy-io/react-auth, and @privy-io/wagmi:

sh
npm i wagmi @privy-io/react-auth @privy-io/wagmi @tanstack/react-query 2. Setup TanStack Query
To start, set up your app with the TanStack Query's React Provider. Wagmi uses TanStack Query under the hood to power its data fetching and caching of wallet and blockchain data.

To set up your app with TanStack Query, in the component where you render your PrivyProvider, import the QueryClient class and the QueryClientProvider component from @tanstack/react-query:

tsx
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
Next, create a new instance of the QueryClient:

tsx
const queryClient = new QueryClient();
Then, like the PrivyProvider, wrap your app's components with the QueryClientProvider. This must be rendered inside the PrivyProvider component.

tsx
<PrivyProvider appId="your-privy-app-id" config={insertYourPrivyConfig}>
<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
</PrivyProvider>
For the client property of the QueryClientProvider, pass the queryClient instance you created.

3. Setup wagmi
   Next, setup wagmi. This involves creating your wagmi config and wrapping your app with the WagmiProvider.

WARNING
While completing the wagmi setup, make sure to import createConfig and WagmiProvider from @privy-io/wagmi. Do not import these from wagmi directly.

Build your wagmi config
To build your wagmi config, import the createConfig method from @privy-io/wagmi:

tsx
import {createConfig} from '@privy-io/wagmi';
This is a drop-in replacement for wagmi's native createConfig, but ensures that the appropriate configuration options are set for the Privy integration. Specifically, it allows Privy to drive wagmi's connectors state, enabling the two libraries to stay in sync.

Next, import your app's required chains from viem/chains and the http transport from wagmi. Your app's required chains should match whatever you configure as supportedChains for Privy.

tsx
import {mainnet, sepolia} from 'viem/chains';
import {http} from 'wagmi';

// Replace this with your app's required chains
Lastly, call createConfig with your imported chains and the http transport like so:

tsx
// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import {createConfig} from '@privy-io/wagmi';
...
export const config = createConfig({
chains: [mainnet, sepolia], // Pass your required chains as an array
transports: {
[mainnet.id]: http(),
[sepolia.id]: http(),
// For each of your required chains, add an entry to `transports` with
// a key of the chain's `id` and a value of `http()`
},
});
Wrap your app with the WagmiProvider
Once you've built your wagmi config, in the same component where you render your PrivyProvider, import the WagmiProvider component from @privy-io/wagmi.

tsx
import {WagmiProvider} from '@privy-io/wagmi';
This is a drop-in replacement for wagmi's native WagmiProvider, but ensures the necessary configuration properties for Privy are set. Specifically, it ensures that the reconnectOnMount prop is set to false, which is required for handling the embedded wallet. Wallets will still be automatically reconnected on mount.

Then, like the PrivyProvider, wrap your app's components with the WagmiProvider. This must be rendered inside both the PrivyProvider and QueryClientProvider components.

tsx
import {PrivyProvider} from '@privy-io/react-auth';
// Make sure to import `WagmiProvider` from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider} from '@privy-io/wagmi';
import {QueryClientProvider} from '@tanstack/react-query';
...
<PrivyProvider appId='insert-your-privy-app-id' config={insertYourPrivyConfig}>
<QueryClientProvider client={queryClient}>
<WagmiProvider config={config}>
{children}
</WagmiProvider>
</QueryClientProvider>
</PrivyProvider>
For the config property of the WagmiProvider, pass the config you created earlier.

Complete example
Altogether, this should look like:

providers.tsxwagmiConfig.tsprivyConfig.ts
tsx
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {PrivyProvider} from '@privy-io/react-auth';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider, createConfig} from '@privy-io/wagmi';

import {privyConfig} from './privyConfig';
import {wagmiConfig} from './wagmiConfig';

const queryClient = new QueryClient();

export default function Providers({children}: {children: React.ReactNode}) {
return (
<PrivyProvider appId="insert-your-privy-app-id" config={privyConfig}>
<QueryClientProvider client={queryClient}>
<WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
</QueryClientProvider>
</PrivyProvider>
);
}
That's it! You've successfully integrated Privy alongside wagmi in your app! 🎉

4. Use wagmi throughout your app
   Once you've completed the setup above, you can use wagmi's React hooks throughout your app to interface with wallets and take read and write actions on the blockchain.

Using wagmi hooks
To use wagmi hooks, like useAccount, in your components, import the hook directly from wagmi and call it as usual:

tsx
import {useAccount} from 'wagmi';

export default const WalletAddress = () => {
const {address} = useAccount();
return <p>Wallet address: {address}</p>;
}
INFO
Injected wallets, like the MetaMask browser extension, cannot be programmatically disconnected from your site; they can only be manually disconnected. In kind, Privy does not currently support programmatically disconnecting a wallet via wagmi's useDisconnect hook. This hook "shims" a disconnection, which can create discrepancies between what wallets are connected to an app vs. wagmi.

Instead of disconnecting a given wallet, you can always prompt a user to connect a different wallet via the connectWallet method.

When to use Privy vs. wagmi
Both Privy's out-of-the-box interfaces and wagmi's React hooks enable you to interface with wallets and to request signatures and transactions.

If your app integrates Privy alongside wagmi, you should:

use Privy to connect external wallets and create embedded wallets
use wagmi to take read or write actions from a connected wallet
Updating the active wallet
With Privy, users may have multiple wallets connected to your app, but wagmi's React hooks return information for only one connected wallet at a time. This is referred to as the active wallet.

To update wagmi to return information for a different connected wallet, first import the useWallets hook from @privy-io/react-auth and the useSetActiveWallet hook from @privy-io/wagmi:

tsx
import {useWallets} from '@privy-io/react-auth';
import {useSetActiveWallet} from '@privy-io/wagmi';
Then, find your desired active wallet from the wallets array returned by useWallets

tsx
const {wallets} = useWallets();
// Replace this logic to find your desired wallet
const newActiveWallet = wallets.find((wallet) => wallet.address === 'insert-your-desired-address');
Lastly, pass your desired active wallet to the setActiveWallet method returned by the useSetActiveWallet hook:

tsx
await setActiveWallet(newActiveWallet);
Demo app
Check out our wagmi demo app to see the hooks listed above in action.

Feel free to take a look at the app's source code to see an end-to-end implementation of Privy with wagmi.

Migrating from wagmi v1
If your app previously used wagmi version 1.x with Privy's @privy-io/wagmi-connector package, follow the steps below to migrate to wagmi version 2.x.

1. Install wagmi v2 and @privy-io/wagmi
   Privy's wagmi integration is now managed by the @privy-io/wagmi package instead of @privy-io/wagmi-connector. The former is maintained only for apps using wagmi version 1.x.

To migrate to the new package, first upgrade your@privy-io/react-auth and wagmi versions to the latest:

sh
npm i @privy-io/react-auth@latest wagmi@latest
Then, install @privy-io/wagmi and the new dependencies required by wagmi version 2.x, including @tanstack/react-query and viem

2. Replace configureChains with createConfig
   Previously, your app configured wagmi via the configureChains method exported by wagmi. You should now configure wagmi via the createConfig method exported by @privy-io/wagmi:

tsx
import {configureChains} from 'wagmi';
// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import {createConfig} from '@privy-io/wagmi';

...

const configureChainsConfig = configureChains([mainnet, sepolia], [publicProvider()]);
const config = createConfig({
chains: [mainnet, sepolia],
transports: {
[mainnet.id]: http(),
[sepolia.id]: http(),
},
}); 3. Replace the PrivyWagmiConnector with the WagmiProvider and QueryClientProvider
Previously, your app's components were wrapped with the PrivyWagmiConnector exported by @privy-io/wagmi-connector. You should now wrap your components with the WagmiProvider exported by @privy-io/wagmi and the QueryClientProvider exported by @tanstack/react-query:

tsx
import {PrivyProvider} from '@privy-io/react-auth';
import {PrivyWagmiConnector} from '@privy-io/wagmi-connector';
// Make sure to import `WagmiProvider` from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider} from '@privy-io/wagmi';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

...

<PrivyProvider appId='your-privy-app-id' config={insertYourPrivyConfig}>
  <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  </QueryClientProvider>
  </PrivyWagmiConnector>
</PrivyProvider>
4. Replace usePrivyWagmi with useSetActiveWallet
Previously, your app used the setActiveWallet method returned by the usePrivyWagmi hook. You should now use the setActiveWallet method returned by the useSetActiveWallet hook:

tsx
import {usePrivyWagmi} from '@privy-io/wagmi-connector';
import {useSetActiveWallet} from '@privy-io/wagmi';

...
const {activeWallet, setActiveWallet} = usePrivyWagmi();
const {setActiveWallet} = useSetActiveWallet();
If you need to get the current active wallet for the user, you can get the active wallet's address from useAccount and filter Privy's useWallets array for the ConnectedWallet object with the same address.

At this point, you should have replaced all usages of @privy-io/wagmi-connector and you can uninstall the package.

5. Migrate wagmi's hooks
   Follow wagmi's migration guide to update how you call wagmi hooks to match their new interfaces.

Quickstart
Get started with Privy in the 5 quick steps below.

0. Prerequisites
   In order to integrate the Privy React SDK, your project must be on:

a minimum React version of 18
a minimum TypeScript version of 5

1. Install the Privy React SDK
   Install the latest version of the Privy React SDK using your package manager of choice:

npmpnpmyarn
sh
npm install @privy-io/react-auth@latest 2. Set your login methods
Navigate to the Login methods page on the Privy Dashboard by selecting your app and then clicking Login Methods in the side bar. Select the account types you'd like users to be able to login with. By default, Privy enables wallet and email logins for new apps; you can update this setting now or later. For more information on how to enable social logins, check out the Dashboard docs

3. Get your Privy app ID
   From the Privy dashboard for select your desired app, navigate to the Settings page in the side bar. On the Basics tab, find the API keys section. Get your Privy app ID, you will need it in the next step.

The app ID serves as an API key used to initialize the Privy React SDK. This value can be safely exposed in a client-side environment, and you can further secure it for production applications.

4. Import Privy into your app
   In your project, import the PrivyProvider component and wrap your app with it. Set the appId field to the app ID you got from the Dashboard in step 3.

Concretely, the PrivyProvider must wrap any component or page that will use the Privy React SDK. It is generally recommended to render it as close to the root of your application as possible.

TIP
If you're new to React and using contexts, check out these resources!

For example, in a NextJS or Create React App project, you may wrap your components like so:

NextJSCreate React App
tsx
'use client';

import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
return (
<PrivyProvider
appId="your-privy-app-id"
config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }} >
{children}
</PrivyProvider>
);
}
This example assumes you are using the NextJS App Router. You can copy the component above into a providers.tsx file, and import it and render it in your project's \_app.tsx.

In the examples above, notice that the PrivyProvider component takes two properties:

Property Description
appId (Required) Your Privy app ID, from step 3.
config (Optional) An object to customize your app's appearance, login vs. linking methods, embedded wallets, supported networks, and more. Learn about customizing your configuration. 5. Just usePrivy! 🎉
Once you've wrapped your app with the PrivyProvider, you can now use the Privy SDK throughout your components and pages via the usePrivy hook!

Check out our starter repo to see what a simple end-to-end integration looks like, or read on to learn how you can use Privy to:

log your users in
prompt users to link additional accounts, as part of progressive onboarding
request signatures and transactions from wallets
and to do so much more!

Using the Privy React SDK
At a high-level, there are two major integration surfaces between your app and Privy:

the PrivyProvider: a React component that loads the SDK and manages state
the usePrivy: a React hook that returns the SDK's key methods and state variables
Both can be imported directly from the SDK, like so:

tsx
import {PrivyProvider, usePrivy} from '@privy-io/react-auth';
The PrivyProvider Component
The PrivyProvider is a React component that loads the Privy SDK in your app.

Concretely, the component renders a React Context that manages your app's interactions with the Privy API and iframe and stores state about the current user and their wallet(s).

This component must wrap any component that will use Privy in your app. It is generally recommended to render this component as close to the root of your application as possible, to ensure your app's components and pages have sufficient access to the SDK.

The PrivyProvider also accepts a config property that can be used to customize Privy within your app, including its appearance, login methods, wallet configurations, and more! Read our configuration guide here.

The usePrivy Hook
Once you've set up the PrivyProvider component, you can then use Privy throughout your app via the usePrivy React hook.

usePrivy returns a set of methods and variables for authenticating and identifying your users, getting their auth status, creating embedded wallets for them, and more. A full list of methods and variables returned by the hook is available here.

Due to the nature of React hooks, there are certain rules for where usePrivy can be invoked:

The hook must be called from within a React component. The hook will throw an error if invoked outside of the scope of a component, as this is forbidden by React.
The component calling the hook must be wrapped by the PrivyProvider. Otherwise, the hook cannot access Privy's React Context, and will throw an error.
Please note that the Privy React SDK exports other hooks as well, including useWallets, useLogin, etc. You should use these hooks as necessary, but the primary integration point between your components and Privy is likely to be the usePrivy hook.

Using the Privy React SDK
At a high-level, there are two major integration surfaces between your app and Privy:

the PrivyProvider: a React component that loads the SDK and manages state
the usePrivy: a React hook that returns the SDK's key methods and state variables
Both can be imported directly from the SDK, like so:

tsx
import {PrivyProvider, usePrivy} from '@privy-io/react-auth';
The PrivyProvider Component
The PrivyProvider is a React component that loads the Privy SDK in your app.

Concretely, the component renders a React Context that manages your app's interactions with the Privy API and iframe and stores state about the current user and their wallet(s).

This component must wrap any component that will use Privy in your app. It is generally recommended to render this component as close to the root of your application as possible, to ensure your app's components and pages have sufficient access to the SDK.

The PrivyProvider also accepts a config property that can be used to customize Privy within your app, including its appearance, login methods, wallet configurations, and more! Read our configuration guide here.

The usePrivy Hook
Once you've set up the PrivyProvider component, you can then use Privy throughout your app via the usePrivy React hook.

usePrivy returns a set of methods and variables for authenticating and identifying your users, getting their auth status, creating embedded wallets for them, and more. A full list of methods and variables returned by the hook is available here.

Due to the nature of React hooks, there are certain rules for where usePrivy can be invoked:

The hook must be called from within a React component. The hook will throw an error if invoked outside of the scope of a component, as this is forbidden by React.
The component calling the hook must be wrapped by the PrivyProvider. Otherwise, the hook cannot access Privy's React Context, and will throw an error.
Please note that the Privy React SDK exports other hooks as well, including useWallets, useLogin, etc. You should use these hooks as necessary, but the primary integration point between your components and Privy is likely to be the usePrivy hook.

Waiting for Privy to be ready
When the PrivyProvider is first rendered on your page, the Privy SDK will initialize some state about the current user. This might include checking if the user has a wallet connected, refreshing expired auth tokens, fetching up-to-date user data, etc.

As a consequence, it's important to wait until the PrivyProvider has finished initializing before you consume Privy's state and interfaces, to ensure that the state you consume is accurate and not stale.

To determine whether the Privy SDK has fully initialized on your page, check the ready Boolean returned by the usePrivy hook. When ready is true, Privy has completed initialization, and your app can consume Privy's state and interfaces.

tsx
const {ready} = usePrivy();
Concretely, you should wait for ready to be true before using any other methods or variables returned by the usePrivy hook.

INFO
