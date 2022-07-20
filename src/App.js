import Onboard from "@web3-onboard/core";
import { useState } from "react";
import {
  VStack,
  Button,
  Input,
  Text,
  HStack,
  Select,
  Box,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { toHex, truncateAddress } from "./utils";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import ledgerModule from "@web3-onboard/ledger";
import walletLinkModule from "@web3-onboard/walletlink";
import { ethers } from "ethers";
import TokenFactoryABI from "./TokenFactory.json";

const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
const ROPSTEN_RPC_URL = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`;
const RINKEBY_RPC_URL = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`;
const MUMBAI_RPC_URL = `https://polygon-mumbai.infura.io/v3/a4905e3b34cc498aa5a839bbcf49b8f2`;
const POLYGON_RPC_URL = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`;

const injected = injectedModule();
const walletConnect = walletConnectModule();
const walletLink = walletLinkModule();
const ledger = ledgerModule();

const onboard = Onboard({
  wallets: [walletLink, walletConnect, injected, ledger],
  chains: [
    {
      id: "0x1", // chain ID must be in hexadecimel
      token: "ETH", // main chain token
      namespace: "evm",
      label: "Ethereum Mainnet",
      rpcUrl: MAINNET_RPC_URL,
    },
    {
      id: "0x3",
      token: "tROP",
      namespace: "evm",
      label: "Ethereum Ropsten Testnet",
      rpcUrl: ROPSTEN_RPC_URL,
    },
    {
      id: "0x4",
      token: "rETH",
      namespace: "evm",
      label: "Ethereum Rinkeby Testnet",
      rpcUrl: RINKEBY_RPC_URL,
    },
    {
      id: "0x13881",
      token: "MATIC",
      namespace: "evm",
      label: "Polygon Mumbai Testnet",
      rpcUrl: MUMBAI_RPC_URL,
    },
    {
      id: "0x89",
      token: "MATIC",
      namespace: "evm",
      label: "Polygon Mainnet",
      rpcUrl: POLYGON_RPC_URL,
    },
  ],
  appMetadata: {
    name: "My App",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    description: "My app using Onboard",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});

export default function Home() {
  const [provider, setProvider] = useState();
  const [account, setAccount] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [symbol, setSymbol] = useState();
  const [initialSupply, setInitialSupply] = useState();
  const [name, setName] = useState();
  const [network, setNetwork] = useState();
  const [contract, setContract] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet();
      setIsLoading(true);
      const { accounts, chains, provider } = wallets[0];
      setAccount(accounts[0].address);
      setChainId(chains[0].id);
      setProvider(new ethers.providers.Web3Provider(provider));
      setIsLoading(false);
      setContract(setupContracts());
    } catch (error) {
      setError(error);
    }
  };

  function setupContracts() {
    debugger;
    const tokenFactoryContract = new ethers.Contract(
      "0x1760fCf985A017AbBCc3aDf40E36125705a118Ee",
      TokenFactoryABI.abi,
      provider
    );
    return tokenFactoryContract;
  }

  const switchNetwork = async () => {
    await onboard.setChain({ chainId: toHex(network) });
  };

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const disconnect = async () => {
    const [primaryWallet] = await onboard.state.get().wallets;
    if (!primaryWallet) return;
    await onboard.disconnectWallet({ label: primaryWallet.label });
    refreshState();
  };

  const createToken = async () => {
    debugger;
    var signer = provider?.getUncheckedSigner(account);
    if (account && signer) {
      var contractWithSigner = contract.connect(signer);
      console.log(contractWithSigner);
      await contractWithSigner.functions
        .createToken(ethers.utils.parseUnits(initialSupply), name, symbol)
        .catch((err) => console.log(err));
    }
  };

  const refreshState = () => {
    setAccount("");
    setChainId("");
    setProvider();
  };

  return (
    <>
      <Text position="absolute" top={0} right="15px">
        If you're in the sandbox, first "Open in New Window" ⬆️
      </Text>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
          >
            Let's connect with
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Onboard
          </Text>
        </HStack>
        {isLoading && <div>Loading...</div>}
        <HStack>
          {!account ? (
            <></>
          ) : (
            <>
              <Input
                variant="outline"
                value={initialSupply}
                placeholder="Insert Initial Supply"
                onChange={(e) => setInitialSupply(e.target.value)}
              ></Input>
              <Input
                variant="outline"
                value={name}
                placeholder="Insert Name"
                onChange={(e) => setName(e.target.value)}
              ></Input>
              <Input
                placeholder="Insert Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              ></Input>
            </>
          )}
        </HStack>
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <>
              <Button onClick={disconnect}>Disconnect</Button>
              <Button onClick={createToken}>Create Token</Button>
            </>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${
            chainId ? Number(chainId) : "No Network"
          }`}</Text>
        </VStack>
        {account && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                </Select>
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
    </>
  );
}
