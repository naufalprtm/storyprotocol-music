// src/index.ts
import { registerMusic } from "./src/services/registerMusic";
import { MusicMetadata } from "./src/models/metadata";
import { config } from "./src/config/env";
import logger from "./src/utils/logger";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

let musicFilePath = process.env.MUSIC_FILE_PATH;

if (!musicFilePath) {
    logger.error("❌ Error: MUSIC_FILE_PATH is not set in .env");
    process.exit(1);
}
if (!path.isAbsolute(musicFilePath)) {
    const basePath = process.cwd();
    musicFilePath = path.join(basePath, musicFilePath);
}

logger.info(`📂 Final music file path: ${musicFilePath}`);
const musicMetadata: MusicMetadata = {
    title: "Midnight Marriage",
    description: "This is a house-style song generated on Suno.",
    ipType: "Music",
    attributes: [
        { key: "Suno Artist", value: "amazedneurofunk956" },
        { key: "Artist ID", value: "4123743b-8ba6-4028-a965-75b79a3ad424" },
        { key: "Source", value: "Suno.com" },
    ],
    media: [],
    creators: [
        { name: config.artistName, address: config.artistAddress, contributionPercent: 100 },
    ],
};

const main = async () => {
    try {
        const result = await registerMusic(musicFilePath, musicMetadata);
        logger.info("✅ Music successfully registered!", result);
    } catch (error) {
        logger.error("❌ Error registering music:", error);
    }
};

main();
