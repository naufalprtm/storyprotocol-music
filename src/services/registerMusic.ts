// src/services/registerMusic.ts
import { createStoryClient } from "../config/storyClient";
import { uploadToIPFS } from "../utils/ipfs";
import { MusicMetadata, NFTMetadata } from "../models/metadata";
import { config } from "../config/env";
import logger from "../utils/logger";
import fs from "fs";
import { keccak256, toHex } from "viem";
import path from "path";

const storyClient = createStoryClient();

const uploadMusicToIPFS = async (musicFilePath: string) => {
    try {
        const resolvedPath = path.resolve(process.cwd(), musicFilePath);
        console.log("🎵 Music file path from .env:", process.env.MUSIC_FILE_PATH);
        console.log("📂 Checking music file at:", resolvedPath);

        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Music file not found: ${resolvedPath}`);
        }

        const musicIpfsHash = await uploadToIPFS(resolvedPath, true);
        return `https://gateway.pinata.cloud/ipfs/${musicIpfsHash}`;
    } catch (error) {
        logger.error("❌ Failed to upload music to IPFS via Pinata:", error);
        throw error;
    }
};

const registerMusicOnBlockchain = async (ipMetadata: MusicMetadata, tokenId: string) => {
    try {
        const ipfsHash = await uploadToIPFS(ipMetadata);
        const client = await storyClient;

        const response = await client.ipAsset.register({
            nftContract: config.nftContractAddress,
            tokenId: tokenId,
            ipMetadata: {
                ipMetadataURI: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                ipMetadataHash: keccak256(toHex(ipfsHash)), 
                nftMetadataHash:  keccak256(toHex(ipfsHash)), 
                nftMetadataURI: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            },
            txOptions: { waitForTransaction: true },
        });

        if (!response.txHash) {
            throw new Error("Transaction hash not found. NFT might already be registered.");
        }

        logger.info(`✅ Music registered on blockchain at transaction hash: ${response.txHash}`);
        return { txHash: response.txHash, ipfsHash };
    } catch (error) {
        logger.error("❌ Failed to register music on blockchain:", error);
        throw error;
    }
};

export const registerMusic = async (musicFilePath: string, metadata: MusicMetadata) => {
    try {
        if (!config.privateKey) {
            throw new Error("PRIVATE_KEY is not set in .env");
        }

        const musicUrl = await uploadMusicToIPFS(musicFilePath);

        const ipMetadata: MusicMetadata = {
            ...metadata,
            ipType: "Music",
            media: [
                {
                    name: metadata.title,
                    url: musicUrl,
                    mimeType: "audio/mpeg",
                },
            ],
            creators: [
                {
                    name: config.artistName,
                    address: config.artistAddress,
                    contributionPercent: 100,
                },
            ],
        };

        const tokenId = "1";

        const { txHash, ipfsHash } = await registerMusicOnBlockchain(ipMetadata, tokenId);

        const nftMetadata: NFTMetadata = {
            name: metadata.title,
            description: `This NFT represents ownership of the song ${metadata.title}.`,
            image: metadata.media?.[0]?.url || config.defaultImageUrl,
            media: [
                {
                    name: metadata.title,
                    url: musicUrl,
                    mimeType: "audio/mpeg",
                },
            ],
            attributes: metadata.attributes,
        };

        const nftIpfsHash = await uploadToIPFS(nftMetadata);
        logger.info(`✅ NFT metadata successfully uploaded to IPFS via Pinata: ${nftIpfsHash}`);

        return { txHash, nftIpfsHash };
    } catch (error) {
        logger.error("❌ Registration process failed:", error);
        throw error;
    }
};