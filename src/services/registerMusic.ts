// src/services/registerMusic.ts
import { createStoryClient } from "../config/storyClient";
import { uploadToIPFS } from "../utils/ipfs";
import { MusicMetadata, NFTMetadata } from "../models/metadata";
import { config } from "../config/env";
import logger from "../utils/logger";
import fs from "fs";
import { toHex } from "viem";

const storyClient = createStoryClient();

const uploadMusicToIPFS = async (musicFilePath: string) => {
    try {
        if (!fs.existsSync(musicFilePath)) {
            throw new Error(`Music file not found: ${musicFilePath}`);
        }

        const musicIpfsHash = await uploadToIPFS(musicFilePath, true);
        return `https://ipfs.io/ipfs/${musicIpfsHash}`;
    } catch (error) {
        logger.error("❌ Failed to upload music to IPFS:", error);
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
                ipMetadataURI: `https://ipfs.io/ipfs/${ipfsHash}`,
                ipMetadataHash: toHex(ipfsHash, { size: 32 }), 
                nftMetadataHash: toHex(ipfsHash, { size: 32 }),
                nftMetadataURI: `https://ipfs.io/ipfs/${ipfsHash}`,
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
        logger.info(`✅ NFT metadata successfully uploaded to IPFS: ${nftIpfsHash}`);

        return { txHash, nftIpfsHash };
    } catch (error) {
        logger.error("❌ Registration process failed:", error);
        throw error;
    }
};
