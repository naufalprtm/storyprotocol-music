// src/config/env.ts
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

console.log("ℹ️ Loading environment variables...");

dotenvExpand.expand(dotenv.config());

const requiredEnvVars = [
    "RPC_PROVIDER_URL",
    "PRIVATE_KEY",
    "CHAIN_ID",
    "ARTIST_NAME",
    "ARTIST_ADDRESS",
    "PINATA_API_KEY",
    "PINATA_SECRET_KEY",
    "PINATA_JWT",
    "NFT_CONTRACT_ADDRESS",
    "DEFAULT_IMAGE_URL"
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

console.log("✅ All required environment variables are set.");

export const config = {
    rpcProviderUrl: process.env.RPC_PROVIDER_URL!,
    privateKey: process.env.PRIVATE_KEY!,
    chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : undefined,
    artistName: process.env.ARTIST_NAME!,
    artistAddress: process.env.ARTIST_ADDRESS?.startsWith("0x") 
        ? process.env.ARTIST_ADDRESS as `0x${string}`
        : (`0x${process.env.ARTIST_ADDRESS ?? ""}` as `0x${string}`),
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY!,
    pinataApiKey: process.env.PINATA_API_KEY!,
    pinataJWT: process.env.PINATA_JWT!,
    nftContractAddress: process.env.NFT_CONTRACT_ADDRESS?.startsWith("0x") 
        ? process.env.NFT_CONTRACT_ADDRESS as `0x${string}`
        : (`0x${process.env.NFT_CONTRACT_ADDRESS ?? ""}` as `0x${string}`),
    defaultImageUrl: process.env.DEFAULT_IMAGE_URL!
};

console.log("🔹 Config Loaded:", {
    rpcProviderUrl: config.rpcProviderUrl,
    chainId: config.chainId,
    artistName: config.artistName,
    artistAddress: config.artistAddress,
    nftContractAddress: config.nftContractAddress,
    defaultImageUrl: config.defaultImageUrl
});

export const getImageUrl = (metadata: any) => {
    return metadata.media?.[0]?.url || config.defaultImageUrl;
};