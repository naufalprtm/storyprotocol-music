// src/config/storyClient.ts
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http, createWalletClient, createPublicClient, defineChain, WalletClient, PublicClient } from "viem";
import { privateKeyToAccount, Account } from "viem/accounts";
import { config } from "./env";

console.debug("📌 Loading environment config...");
const formattedPrivateKey = config.privateKey.startsWith("0x") 
    ? config.privateKey 
    : `0x${config.privateKey}`;

console.debug("🔑 Formatted Private Key:", formattedPrivateKey);

export const account: Account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
console.debug("👤 Account Address:", account.address);

const chainId = 'aeneid';
console.debug("🔗 Using Chain ID:", chainId);

const storyConfig: StoryConfig = {
    account,
    transport: http(config.rpcProviderUrl),
    chainId,
};

export const createStoryClient = async () => {
    try {
        console.debug("🚀 Initializing StoryClient...");
        const client = await StoryClient.newClient(storyConfig);
        console.debug("✅ StoryClient initialized successfully");
        return client;
    } catch (error) {
        console.error("❌ Failed to initialize StoryClient:", error);
        throw error;
    }
};

const customChain = defineChain({
    account,
    id: 1315,
    name: "Aeneid Testnet",
    nativeCurrency: {
        name: "IP",
        symbol: "IP",
        decimals: 18,
    },
    rpcUrls: { default: { http: [config.rpcProviderUrl] } },
});

console.debug("🌍 Custom Chain Configured:", customChain);

export const publicClient: PublicClient = createPublicClient({
    chain: customChain,
    transport: http(config.rpcProviderUrl),
});
console.debug("📡 Public Client created");

export const walletClient: WalletClient = createWalletClient({
    chain: customChain,
    transport: http(config.rpcProviderUrl),
    account,
});
console.debug("💰 Wallet Client created");