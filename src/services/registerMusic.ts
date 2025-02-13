// src/services/registerMusic.ts
import { createStoryClient, walletClient, publicClient } from "../config/storyClient";
import { uploadToIPFS } from "../utils/ipfs";
import { MusicMetadata, NFTMetadata } from "../models/metadata";
import { config } from "../config/env";
import logger from "../utils/logger";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { IpMetadata } from "@story-protocol/core-sdk";
import MusicContract from "../../out/Music.sol/Music.json";
import { ethers } from "ethers";

const storyClient = createStoryClient();
const provider = new ethers.JsonRpcProvider(config.rpcProviderUrl);
const wallet = new ethers.Wallet(config.privateKey, provider);
const musicContract = new ethers.Contract(config.nftContractAddress, MusicContract.abi, wallet);

export const uploadMusicToIPFS = async (musicFilePath: string) => {
    try {
        if (!fs.existsSync(musicFilePath)) throw new Error(`Music file not found: ${musicFilePath}`);

        const musicIpfsHash = await uploadToIPFS(musicFilePath, true);
        return `https://gateway.pinata.cloud/ipfs/${musicIpfsHash}`;
    } catch (error) {
        logger.error("❌ Failed to upload music to IPFS:", error);
        throw error;
    }
};

const mintTest = async (recipient) => {
    try {
        console.log("Minting NFT to:", recipient);
        const contract = new ethers.Contract(musicContract, MusicContract.abi, wallet);
        const tx = await contract.mint(recipient);
        const receipt = await tx.wait();
        console.log("✅ NFT Minted! Transaction Hash:", receipt.hash);
    } catch (error) {
        console.error("❌ Minting failed:", error);
    }
};
const recipientAddress = process.env.ARTIST_ADDRESS;
mintTest(recipientAddress);

export const mintMusicNFT = async (
    title,
    description,
    attributes,
    artist,
    genre,
    ipfsHash,
    licenseFee,
    metadataURI
) => {
    try {
        console.log(`📝 Minting NFT for ${title}...`);
        
        const provider = new ethers.JsonRpcProvider("https://aeneid.storyrpc.io/");
        const wallet = new ethers.Wallet(config.privateKey, provider);
        const contract = new ethers.Contract(config.nftContractAddress, MusicContract.abi, wallet);

        const client = await createStoryClient();
        const ipMetadata = client.ipAsset.generateIpMetadata({
            title, 
            genre,
            ipfsHash,
            licenseFee,
            metadataURI,
            creators: [{ name: artist, address: config.artistAddress, contributionPercent: 100 }],
        });

        const nftMetadata = {
            name: `NFT representing ${title}`,
            description: `This NFT represents ownership of ${title}`,
            image: config.defaultImageUrl,
            attributes,
            media: [
                {
                  name: config.artistName,
                  url: 'https://amaranth-worried-thrush-99.mypinata.cloud/ipfs/bafybeihxhagfqe2rqwqtakkkuyl4ycssv45azm2lfsz3wczbg66xneq3hu',
                  mimeType: 'audio/mpeg',
                },
              ],
        };

        const ipIpfsHash = await uploadToIPFS(ipMetadata);
        const ipHash = createHash("sha256").update(JSON.stringify(ipMetadata)).digest("hex");
        const nftIpfsHash = await uploadToIPFS(nftMetadata);
        const nftHash = createHash("sha256").update(JSON.stringify(nftMetadata)).digest("hex");

        console.log(`💾 IPFS hashes: ${ipIpfsHash}, ${nftIpfsHash}`);

        const tx = await contract.mintMusicNFT(
            title, 
            description,
            artist, 
            genre, 
            ipfsHash, 
            licenseFee, 
            `https://ipfs.io/ipfs/${nftIpfsHash}`
        );
        
        const receipt = await tx.wait();
        
        const tokenId = receipt.logs[0]?.topics[3];
        console.log(`✅ NFT minted with tokenId ${tokenId}`);

        const response = await client.ipAsset.register({
            nftContract: config.nftContractAddress,
            tokenId,
            ipMetadata: {
                ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                ipMetadataHash: `0x${ipHash}`,
                nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                nftMetadataHash: `0x${nftHash}`,
            },
            txOptions: { waitForTransaction: true },
        });

        console.log(`✅ Registered with Story Protocol, IPA ID: ${response.ipId}`);
        return { tokenId, txHash: response.txHash, ipId: response.ipId };
    } catch (error) {
        console.error("❌ Error minting NFT:", error);
        throw error;
    }
};

export const registerAsIPAsset = async (tokenId) => {
    try {
        console.log(`🔹 Registering tokenId ${tokenId} as IP asset...`);

        const provider = new ethers.JsonRpcProvider(config.rpcProviderUrl);
        const wallet = new ethers.Wallet(config.privateKey, provider);
        const contract = new ethers.Contract(config.nftContractAddress, MusicContract.abi, wallet);

        const tx = await contract.registerAsIPAsset(tokenId);
        const receipt = await tx.wait();

        const event = receipt.logs.find(log => log.address.toLowerCase() === config.nftContractAddress.toLowerCase());
        const ipId = event ? event.topics[1] : null;

        console.log(`✅ Successfully registered tokenId ${tokenId} as IP asset. IP ID: ${ipId}`);
        return { tokenId, ipId, txHash: receipt.transactionHash };
    } catch (error) {
        console.error("❌ Error registering IP asset:", error);
        throw error;
    }
};