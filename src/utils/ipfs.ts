// src/utils/ipfs.ts
import { create } from "ipfs-http-client";
import fs from "fs";
import { config } from "../config/env";
import logger from "./logger";

const ipfs = create({ url: config.ipfsGatewayUrl });

export const uploadToIPFS = async (data: object | string, isFile: boolean = false) => {
    try {
        const result = isFile
            ? await ipfs.add(fs.readFileSync(data as string))
            : await ipfs.add(JSON.stringify(data));
        
        logger.info(`✅ Uploaded to IPFS: ${result.path}`);
        return result.path;
    } catch (error) {
        logger.error(`❌ IPFS upload failed: ${error}`);
        throw error;
    }
};
