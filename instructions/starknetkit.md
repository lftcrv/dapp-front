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
