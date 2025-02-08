// src/config/env.ts
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());

const requiredEnvVars = [
    "RPC_PROVIDER_URL",
    "PRIVATE_KEY",
    "CHAIN_ID",
    "ARTIST_NAME",
    "ARTIST_ADDRESS",
    "IPFS_GATEWAY_URL",
    "NFT_CONTRACT_ADDRESS"
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
}

export const config = {
    rpcProviderUrl: process.env.RPC_PROVIDER_URL!,
    privateKey: process.env.PRIVATE_KEY!,
    chainId: process.env.CHAIN_ID as "aeneid" | undefined,
    artistName: process.env.ARTIST_NAME!,
    artistAddress: process.env.ARTIST_ADDRESS!,
    ipfsGatewayUrl: process.env.IPFS_GATEWAY_URL!,
    defaultImageUrl: process.env.DEFAULT_IMAGE_URL || "https://picsum.photos/200",
    nftContractAddress: process.env.NFT_CONTRACT_ADDRESS?.startsWith("0x") 
        ? process.env.NFT_CONTRACT_ADDRESS as `0x${string}`
        : `0x${process.env.NFT_CONTRACT_ADDRESS}` as `0x${string}`
};
