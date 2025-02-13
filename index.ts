// src/index.ts
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import logger from "./src/utils/logger";
import { mintMusicNFT, uploadMusicToIPFS, registerAsIPAsset  } from "./src/services/registerMusic";
import { MusicMetadata } from "./src/models/metadata";
import { config } from "./src/config/env";

dotenv.config();

const baseDir = process.env.BASE_DIR ? path.resolve(process.cwd(), process.env.BASE_DIR) : process.cwd();
const musicFilePath = process.env.MUSIC_FILE_PATH ? path.join(baseDir, process.env.MUSIC_FILE_PATH) : "";

if (!musicFilePath || !fs.existsSync(musicFilePath)) {
    logger.error("❌ Error: MUSIC_FILE_PATH is missing or invalid.");
    process.exit(1);
}

logger.info(`📂 Found music file: ${musicFilePath}`);

const musicMetadata: MusicMetadata = {
    title: "Story Protocol MusicTest-Zixine-Create-At-SUNO",
    description: "This is song generated on Suno.",
    ipType: "Music",
    artist: "zixine",
    genre: "Pop",
    ipfsHash: "bafybeihxhagfqe2rqwqtakkkuyl4ycssv45azm2lfsz3wczbg66xneq3hu",
    licenseFee: 0,
    metadataURI: "",
    attributes: [
        { key: "Suno Artist", value: "zixine" },
        { key: "Artist ID", value: "https://suno.com/@zixine" },
        { key: "Source", value: "Suno.com" },
    ],
    media: [
        {
          name: config.artistName,
          url: 'https://amaranth-worried-thrush-99.mypinata.cloud/ipfs/bafybeihxhagfqe2rqwqtakkkuyl4ycssv45azm2lfsz3wczbg66xneq3hu',
          mimeType: 'audio/mpeg',
        },
      ],
    creators: [{ name: config.artistName, address: config.artistAddress, contributionPercent: 100 }],
};

const main = async () => {
    try {
        const ipfsHash = await uploadMusicToIPFS(musicFilePath);
        logger.info(`📤 Uploaded to IPFS: ${ipfsHash}`);

        musicMetadata.ipfsHash = ipfsHash;

        const result = await mintMusicNFT(
            musicMetadata.title,
            musicMetadata.description,
            musicMetadata.attributes,
            musicMetadata.artist,
            musicMetadata.genre,
            musicMetadata.ipfsHash,
            musicMetadata.licenseFee,
            musicMetadata.metadataURI
        );
        
        logger.info("✅ Music successfully registered!", result);

        if (result?.tokenId) {
            const ipId = await registerAsIPAsset(result.tokenId);
            logger.info(`✅ Registered as IP Asset with IP ID: ${ipId}`);
        } else {
            logger.error("❌ Failed to register as IP Asset: tokenId is missing.");
        }

    } catch (error) {
        logger.error("❌ Error registering music:", error);
    }
};

main();