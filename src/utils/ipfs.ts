// src/utils/ipfs.ts
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { config } from "../config/env";
import logger from "./logger";

const PINATA_API_KEY = config.pinataApiKey;
const PINATA_SECRET_API_KEY = config.pinataSecretApiKey;
const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export const uploadToIPFS = async (data: object | string, isFile: boolean = false) => {
    try {
        const formData = new FormData();

        if (isFile) {
            const fileStream = fs.createReadStream(data as string);
            formData.append("file", fileStream);
        } else {
            const jsonBuffer = Buffer.from(JSON.stringify(data));
            formData.append("file", jsonBuffer, { filename: "metadata.json" });
        }

        const response = await axios.post(PINATA_ENDPOINT, formData, {
            headers: {
                "Authorization": `Bearer ${config.pinataJWT}`,
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`
            },
        });

        if (response.status !== 200) {
            throw new Error(`Pinata upload failed: ${response.data}`);
        }

        const ipfsHash = response.data.IpfsHash;
        logger.info(`✅ Uploaded to Pinata IPFS: ${ipfsHash}`);
        return ipfsHash;
    } catch (error) {
        logger.error(`❌ Pinata IPFS upload failed: ${error}`);
        throw error;
    }
};
