// src/index.ts
import { registerMusic } from "./services/registerMusic";
import { MusicMetadata } from "./models/metadata";
import { config } from "./config/env";
import logger from "./utils/logger";

const musicFilePath = process.env.MUSIC_FILE_PATH || "";

if (!musicFilePath) {
    logger.error("❌ Error: MUSIC_FILE_PATH is not set in .env");
    process.exit(1);
}

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
