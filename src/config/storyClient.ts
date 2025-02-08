// src/config/storyClient.ts
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount, Account } from "viem/accounts";
import { config } from "./env";


const formattedPrivateKey = config.privateKey.startsWith("0x") 
    ? config.privateKey 
    : `0x${config.privateKey}`;

export const account: Account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

const storyConfig: StoryConfig = {
    account: account,
    transport: http(config.rpcProviderUrl),
    chainId: config.chainId as "aeneid", 
};

export const createStoryClient = async () => {
    try {
        return await StoryClient.newClient(storyConfig);
    } catch (error) {
        console.error("❌ Failed to initialize StoryClient:", error);
        throw error;
    }
};
