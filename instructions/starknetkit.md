StarknetKit
Docs
Getting Started
Usage
Usage
Installation
To get started with integrating the StarknetKit SDK in your dApp, you will need to install the StarknetKit package and its peer dependencies:

npm install starknetkit

Imports
After installation, we get access to different methods, such as connect, disconnect, etc which we should import for use in our application:

import { connect, disconnect } from "starknetkit"

Establishing a connection
To establish a wallet connection, we need to call the connect method which was imported earlier like this:

const { wallet, connector, connectorData } = await connect()

The default order of connectors is as follows:

Argent X
Braavos
Argent Mobile
Argent Web Wallet
The order of connectors can be changed by passing connectors argument to the connect method.

import { connect } from "starknetkit"
import { WebWalletConnector } from "starknetkit/webwallet"
import { InjectedConnector } from "starknetkit/injected"

const { wallet, connectorData } = await connect({
connectors: [
new WebWalletConnector(),
new InjectedConnector({ options: { id: "argentX" } }),
],
})

Connect function parameters types are: ConnectOptions or ConnectOptionsWithConnectors.

ConnectOptions is used to connect with the default connectors
ConnectOptionsWithConnectors is used to connect with specific connectors (or define a custom order).
export interface ConnectOptions extends GetWalletOptions {
dappName?: string
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
resultType?: "connector" | "wallet"
webWalletUrl?: string
argentMobileOptions: ArgentMobileConnectorOptions
}

export interface ConnectOptionsWithConnectors
extends Omit<ConnectOptions, "webWalletUrl" | "argentMobileOptions"> {
connectors?: StarknetkitConnector[]
}
Below is an example function that establishes a connection, then sets the connection and address states:

const connectWallet = async () => {
const { wallet, connectorData } = await connect()

if (wallet && connectorData) {
setConnection(wallet)
setAddress(connectorData.account)
}
}

To reconnect to a previously connected wallet on load:

const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

Example:

useEffect(() => {
const connectToStarknet = async () => {
const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

    if (wallet && wallet.isConnected) {
      setConnection(wallet)
      setAddress(wallet.selectedAddress)
    }

}

connectToStarknet()
}, [])

Connect with connection options example
const { wallet, connectorData } = await connect({
modalMode: "alwaysAsk",
modalTheme: "light",
webWalletUrl: "https://web.argent.xyz",
argentMobileOptions: {
dappName: "Dapp name",
projectId: "YOUR_PROJECT_ID", // wallet connect project id
chainId: "SN_MAIN",
url: window.location.hostname,
icons: ["https://your-icon-url.com"],
rpcUrl: "YOUR_RPC_URL",
},
})

Connection parameters
interface ConnectOptions {
argentMobileOptions?: ArgentMobileConnectorOptions
dappName?: string
connectors?: StarknetkitConnector[] // can be used to define a custom order for the connectors
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
webWalletUrl?: string
resultType?: "connector" | "wallet"
sort?: Sort
include?: FilterList
exclude?: FilterList
}

interface ArgentMobileConnectorOptions {
dappName?: string
projectId?: string // wallet connect project id
chainId?: constants.NetworkName
description?: string
url?: string
icons?: string[]
rpcUrl?: string
}
Disconnecting wallet
To disconnect an existing connection, simply call the disconnect method from our imports, then set previously defined states to undefined:

await disconnect()

Example:

const disconnectWallet = async () => {
await disconnect()

setConnection(undefined)
setAddress("")
}

Disconnection Params
await disconnect({ clearLastWallet: true })

Available methods and data
Wallet
wallet is a StarknetWindowObject and supports JSON-RPC Integration. Requests to wallet can be done using the .request method. The following methods are available:

wallet_getPermissions
wallet_requestAccounts
wallet_watchAsset
wallet_addStarknetChain
wallet_switchStarknetChain
wallet_requestChainId
wallet_deploymentData
wallet_addInvokeTransaction
wallet_addDeclareTransaction
wallet_signTypedData
wallet_supportedSpecs
wallet_supportedWalletApi
Examples:

await wallet.request({ type: "wallet_requestAccounts" }) // replaces .enable()

await wallet.request({ type: "wallet_requestChainId" })

await wallet.request({
type: "wallet_addInvokeTransaction",
params: {
calls: [call],
},
})

await wallet.request({
type: "wallet_signTypedData",
params: typedData,
})

wallet can also listen to events using the .on method:

const accountChangeHandler: AccountChangeEventHandler = (
accounts?: string[],
) => {}

const networkChangeHandler: NetworkChangeEventHandler = async (
chainId?: ChainId,
accounts?: string[],
) => {}

wallet?.on("accountsChanged", accountChangeHandler)
wallet?.on("networkChanged", networkChangeHandler)

// Remove event listener
wallet?.off("accountsChanged", accountChangeHandler)
wallet?.off("networkChanged", networkChangeHandler)

Connector data
connectorData is an object containing the account and chainId of the connected wallet:

type ConnectorData = {
account?: string
chainId?: bigint
}
Connector
connector is an object containing data and methods related to the connected wallet. It is useful for StarknetKit and starknet-react combo, see here.

StarknetKit
Docs
Getting Started
Usage
Usage
Installation
To get started with integrating the StarknetKit SDK in your dApp, you will need to install the StarknetKit package and its peer dependencies:

npm install starknetkit

Imports
After installation, we get access to different methods, such as connect, disconnect, etc which we should import for use in our application:

import { connect, disconnect } from "starknetkit"

Establishing a connection
To establish a wallet connection, we need to call the connect method which was imported earlier like this:

const { wallet, connector, connectorData } = await connect()

The default order of connectors is as follows:

Argent X
Braavos
Argent Mobile
Argent Web Wallet
The order of connectors can be changed by passing connectors argument to the connect method.

import { connect } from "starknetkit"
import { WebWalletConnector } from "starknetkit/webwallet"
import { InjectedConnector } from "starknetkit/injected"

const { wallet, connectorData } = await connect({
connectors: [
new WebWalletConnector(),
new InjectedConnector({ options: { id: "argentX" } }),
],
})

Connect function parameters types are: ConnectOptions or ConnectOptionsWithConnectors.

ConnectOptions is used to connect with the default connectors
ConnectOptionsWithConnectors is used to connect with specific connectors (or define a custom order).
export interface ConnectOptions extends GetWalletOptions {
dappName?: string
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
resultType?: "connector" | "wallet"
webWalletUrl?: string
argentMobileOptions: ArgentMobileConnectorOptions
}

export interface ConnectOptionsWithConnectors
extends Omit<ConnectOptions, "webWalletUrl" | "argentMobileOptions"> {
connectors?: StarknetkitConnector[]
}
Below is an example function that establishes a connection, then sets the connection and address states:

const connectWallet = async () => {
const { wallet, connectorData } = await connect()

if (wallet && connectorData) {
setConnection(wallet)
setAddress(connectorData.account)
}
}

To reconnect to a previously connected wallet on load:

const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

Example:

useEffect(() => {
const connectToStarknet = async () => {
const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

    if (wallet && wallet.isConnected) {
      setConnection(wallet)
      setAddress(wallet.selectedAddress)
    }

}

connectToStarknet()
}, [])

Connect with connection options example
const { wallet, connectorData } = await connect({
modalMode: "alwaysAsk",
modalTheme: "light",
webWalletUrl: "https://web.argent.xyz",
argentMobileOptions: {
dappName: "Dapp name",
projectId: "YOUR_PROJECT_ID", // wallet connect project id
chainId: "SN_MAIN",
url: window.location.hostname,
icons: ["https://your-icon-url.com"],
rpcUrl: "YOUR_RPC_URL",
},
})

Connection parameters
interface ConnectOptions {
argentMobileOptions?: ArgentMobileConnectorOptions
dappName?: string
connectors?: StarknetkitConnector[] // can be used to define a custom order for the connectors
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
webWalletUrl?: string
resultType?: "connector" | "wallet"
sort?: Sort
include?: FilterList
exclude?: FilterList
}

interface ArgentMobileConnectorOptions {
dappName?: string
projectId?: string // wallet connect project id
chainId?: constants.NetworkName
description?: string
url?: string
icons?: string[]
rpcUrl?: string
}
Disconnecting wallet
To disconnect an existing connection, simply call the disconnect method from our imports, then set previously defined states to undefined:

await disconnect()

Example:

const disconnectWallet = async () => {
await disconnect()

setConnection(undefined)
setAddress("")
}

Disconnection Params
await disconnect({ clearLastWallet: true })

Available methods and data
Wallet
wallet is a StarknetWindowObject and supports JSON-RPC Integration. Requests to wallet can be done using the .request method. The following methods are available:

wallet_getPermissions
wallet_requestAccounts
wallet_watchAsset
wallet_addStarknetChain
wallet_switchStarknetChain
wallet_requestChainId
wallet_deploymentData
wallet_addInvokeTransaction
wallet_addDeclareTransaction
wallet_signTypedData
wallet_supportedSpecs
wallet_supportedWalletApi
Examples:

await wallet.request({ type: "wallet_requestAccounts" }) // replaces .enable()

await wallet.request({ type: "wallet_requestChainId" })

await wallet.request({
type: "wallet_addInvokeTransaction",
params: {
calls: [call],
},
})

await wallet.request({
type: "wallet_signTypedData",
params: typedData,
})

wallet can also listen to events using the .on method:

const accountChangeHandler: AccountChangeEventHandler = (
accounts?: string[],
) => {}

const networkChangeHandler: NetworkChangeEventHandler = async (
chainId?: ChainId,
accounts?: string[],
) => {}

wallet?.on("accountsChanged", accountChangeHandler)
wallet?.on("networkChanged", networkChangeHandler)

// Remove event listener
wallet?.off("accountsChanged", accountChangeHandler)
wallet?.off("networkChanged", networkChangeHandler)

Connector data
connectorData is an object containing the account and chainId of the connected wallet:

type ConnectorData = {
account?: string
chainId?: bigint
}
Connector
connector is an object containing data and methods related to the connected wallet. It is useful for StarknetKit and starknet-react combo, see here.

StarknetKit
Docs
Getting Started
Usage
Usage
Installation
To get started with integrating the StarknetKit SDK in your dApp, you will need to install the StarknetKit package and its peer dependencies:

npm install starknetkit

Imports
After installation, we get access to different methods, such as connect, disconnect, etc which we should import for use in our application:

import { connect, disconnect } from "starknetkit"

Establishing a connection
To establish a wallet connection, we need to call the connect method which was imported earlier like this:

const { wallet, connector, connectorData } = await connect()

The default order of connectors is as follows:

Argent X
Braavos
Argent Mobile
Argent Web Wallet
The order of connectors can be changed by passing connectors argument to the connect method.

import { connect } from "starknetkit"
import { WebWalletConnector } from "starknetkit/webwallet"
import { InjectedConnector } from "starknetkit/injected"

const { wallet, connectorData } = await connect({
connectors: [
new WebWalletConnector(),
new InjectedConnector({ options: { id: "argentX" } }),
],
})

Connect function parameters types are: ConnectOptions or ConnectOptionsWithConnectors.

ConnectOptions is used to connect with the default connectors
ConnectOptionsWithConnectors is used to connect with specific connectors (or define a custom order).
export interface ConnectOptions extends GetWalletOptions {
dappName?: string
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
resultType?: "connector" | "wallet"
webWalletUrl?: string
argentMobileOptions: ArgentMobileConnectorOptions
}

export interface ConnectOptionsWithConnectors
extends Omit<ConnectOptions, "webWalletUrl" | "argentMobileOptions"> {
connectors?: StarknetkitConnector[]
}
Below is an example function that establishes a connection, then sets the connection and address states:

const connectWallet = async () => {
const { wallet, connectorData } = await connect()

if (wallet && connectorData) {
setConnection(wallet)
setAddress(connectorData.account)
}
}

To reconnect to a previously connected wallet on load:

const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

Example:

useEffect(() => {
const connectToStarknet = async () => {
const { wallet, connectorData } = await connect({ modalMode: "neverAsk" })

    if (wallet && wallet.isConnected) {
      setConnection(wallet)
      setAddress(wallet.selectedAddress)
    }

}

connectToStarknet()
}, [])

Connect with connection options example
const { wallet, connectorData } = await connect({
modalMode: "alwaysAsk",
modalTheme: "light",
webWalletUrl: "https://web.argent.xyz",
argentMobileOptions: {
dappName: "Dapp name",
projectId: "YOUR_PROJECT_ID", // wallet connect project id
chainId: "SN_MAIN",
url: window.location.hostname,
icons: ["https://your-icon-url.com"],
rpcUrl: "YOUR_RPC_URL",
},
})

Connection parameters
interface ConnectOptions {
argentMobileOptions?: ArgentMobileConnectorOptions
dappName?: string
connectors?: StarknetkitConnector[] // can be used to define a custom order for the connectors
modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
modalTheme?: "light" | "dark" | "system"
storeVersion?: StoreVersion | null
webWalletUrl?: string
resultType?: "connector" | "wallet"
sort?: Sort
include?: FilterList
exclude?: FilterList
}

interface ArgentMobileConnectorOptions {
dappName?: string
projectId?: string // wallet connect project id
chainId?: constants.NetworkName
description?: string
url?: string
icons?: string[]
rpcUrl?: string
}
Disconnecting wallet
To disconnect an existing connection, simply call the disconnect method from our imports, then set previously defined states to undefined:

await disconnect()

Example:

const disconnectWallet = async () => {
await disconnect()

setConnection(undefined)
setAddress("")
}

Disconnection Params
await disconnect({ clearLastWallet: true })

Available methods and data
Wallet
wallet is a StarknetWindowObject and supports JSON-RPC Integration. Requests to wallet can be done using the .request method. The following methods are available:

wallet_getPermissions
wallet_requestAccounts
wallet_watchAsset
wallet_addStarknetChain
wallet_switchStarknetChain
wallet_requestChainId
wallet_deploymentData
wallet_addInvokeTransaction
wallet_addDeclareTransaction
wallet_signTypedData
wallet_supportedSpecs
wallet_supportedWalletApi
Examples:

await wallet.request({ type: "wallet_requestAccounts" }) // replaces .enable()

await wallet.request({ type: "wallet_requestChainId" })

await wallet.request({
type: "wallet_addInvokeTransaction",
params: {
calls: [call],
},
})

await wallet.request({
type: "wallet_signTypedData",
params: typedData,
})

wallet can also listen to events using the .on method:

const accountChangeHandler: AccountChangeEventHandler = (
accounts?: string[],
) => {}

const networkChangeHandler: NetworkChangeEventHandler = async (
chainId?: ChainId,
accounts?: string[],
) => {}

wallet?.on("accountsChanged", accountChangeHandler)
wallet?.on("networkChanged", networkChangeHandler)

// Remove event listener
wallet?.off("accountsChanged", accountChangeHandler)
wallet?.off("networkChanged", networkChangeHandler)

Connector data
connectorData is an object containing the account and chainId of the connected wallet:

type ConnectorData = {
account?: string
chainId?: bigint
}
Connector
connector is an object containing data and methods related to the connected wallet. It is useful for StarknetKit and starknet-react combo, see here.

StarknetKit
Docs
Connectors
Injected
Injected connector
We provide support for the two popular Wallet extensions on Starknet, Argent X and Braavos.

Argent X
ArgentX is the first open-source wallet on StarkNet powered by native account abstraction. Available as a browser extension across different browsers’ web stores, Argent X helps you create, manage, and connect accounts to decentralized applications built on StarkNet.

Braavos
Braavos Smart Wallet for StarkNet makes self-custodial asset management easier than ever! With Braavos, you can securely access decentralized applications on StarkNet and manage your assets from within your browser.

Establishing a Connection
To enable the Injected connector, you need to first import the InjectedConnector from StarknetKit:

import { connect, disconnect } from "starknetkit"
import { InjectedConnector } from "starknetkit/injected"
After importing, you need to call the connect method, passing in your Argent X/Braavos connector:

const { wallet } = await connect({
connectors: [
new InjectedConnector({
options: { id: "argentX" },
}),
new InjectedConnector({
options: { id: "braavos" },
}),
],
})
If you face import errors with typescript, head to your tsconfig.json, and update your moduleResolution and module to use Bundler and ES2015 respectively.

Connection Parameters
The Injected Connector takes a single param options used to specify the id of the connector to be used. Name and icon can be passed as additional (optional) parameters.

// with id only
new InjectedConnector({
options: { id: "argentX" },
})
new InjectedConnector({
options: { id: "braavos" },
})

// with id, name and icon
new InjectedConnector({
options: {
id: "argentX",
name: "Argent X",
icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0a....",
},
})

new InjectedConnector({
options: {
id: "braavos",
name: "Braavos",
icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0a....",
},
})


StarknetKit
Docs
StarknetKit with Starknet-react
Basics
StarknetKit with Starknet-react
Starknet-react is an open-source collection of React providers and hooks designed by the Apibara team for Starknet.

Our modular design greatly inspired by starknet-react, ensures you can easily integrate StarknetKit in any existing or new starknet-react project.

One big plus of using starknet-react is that it provides you with the opportunity to customize the look and feel of your pop-up modal for wallet connections.

Installations
To get started, you will need to install the StarknetKit and starknet-react packages.

npm install starknetkit @starknet-react/core @starknet-react/chains

The connectors we provide are currently just compatible with starknet-react/core@next (v3).

For starknet-react v2, you can use the connectors provided in starknetkit@1.1.9.

Starknet Provider
Next up, we’ll go ahead to create a starknet-provider.jsx component which will contain all our configurations. In here we’ll need to specify the chains our dApp exists on, the provider we’ll be using for calls, and our connectors.

Imports
To get started, we'll need to import the StarknetConfig and publicProvider components.

import { InjectedConnector } from "starknetkit/injected"
import { ArgentMobileConnector } from "starknetkit/argentMobile" 
import { WebWalletConnector } from "starknetkit/webwallet"
import { mainnet, sepolia } from "@starknet-react/chains" 
import { StarknetConfig, publicProvider } from "@starknet-react/core"; 
If you face import errors with typescript, head to your tsconfig.json, and update your moduleResolution and module to use Bundler and ES2015 respectively.

Defining chains, providers and connectors
Within our App, we'll create an array of chains, and connectors. This will be further passed as a prop to the StarknetConfig component.

const chains = [mainnet, sepolia]
const connectors = [
  new InjectedConnector({ options: { id: "braavos", name: "Braavos" }}),
  new InjectedConnector({ options: { id: "argentX", name: "Argent X" }}),
  new WebWalletConnector({ url: "https://web.argent.xyz" }),
  new ArgentMobileConnector(),
]

We'll then proceed by Swaddling our app with the StarknetConfig component. This provides a React Context for the application beneath to utilize shared data and hooks.

return (
  <StarknetConfig
    chains={chains}
    provider={publicProvider()}
    connectors={connectors}
  >
    {children}
  </StarknetConfig>
)

Finally, we'll head to our App.jsx and wrap our entire application with the provider we just created, in order to have access to all specified configurations.

export default function App() {
  return (
    <StarknetProvider>
      <Home />
    </StarknetProvider>
  );
}

Establishing connection
Having configured our starknet-provider.jsx component, we can now easily utilize hooks from starknet-react to establish wallet connections, carry out dapp interactions and so many more.

Here's a simple application that utilizes starknet-react to establish wallet connections:

import React from "react";
 
import { InjectedConnector } from "starknetkit/injected";
import { ArgentMobileConnector, isInArgentMobileAppBrowser } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, publicProvider } from "@starknet-react/core";
 
export default function StarknetProvider({ children }) {
  const chains = [mainnet, sepolia]
 
  const connectors = isInArgentMobileAppBrowser() ? [
    ArgentMobileConnector.init({
      options: {
        dappName: "Example dapp",
        projectId: "example-project-id",
      },
      inAppBrowserOptions: {},
    })
  ] : [
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" }}),
    new InjectedConnector({ options: { id: "argentX", name: "Argent X" }}),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    ArgentMobileConnector.init({
      options: {
        dappName: "Example dapp",
        projectId: "example-project-id",
      }
    })
  ]
 
  return(
    <StarknetConfig
      chains={chains}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  )
}

StarknetKit
Docs
StarknetKit with Starknet-react
Usage with modal
Using StarknetKit modal with starknet-react
You might want to use starknet-react, but you don't have a need to build a custom modal component from scratch. To make your life easier, we made the default StarknetKit modal available for import with starknet-react.

To get started, you need to first import the useStarknetkitConnectModal and useConnect components:

import { useStarknetkitConnectModal } from "starknetkit";
import { useConnect } from "@starknet-react/core";

After importing, you can now use the default modal in your app:

const { connect, connectors } = useConnect();
const { starknetkitConnectModal } = useStarknetkitConnectModal({
  connectors: connectors
})
 
async function connectWallet() {
  const { connector } = await starknetkitConnectModal()
  if (!connector) {
    return
  }
 
  await connect({ connector })
}

PS: Ensure to setup your StarknetProvider first.