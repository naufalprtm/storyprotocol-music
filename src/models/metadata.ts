// src/models/metadata.ts
export interface MusicMetadata {
    title: string;
    description: string;
    ipType: string; 
    artist: string;  
    genre: string;   
    ipfsHash: string;  
    licenseFee: number;  
    metadataURI: string;  
    media: {
        name: string;
        url: string;
        mimeType: string;
    }[];  
    attributes: {
        key: string;
        value: string;
    }[];  
    creators: {
        name: string;
        address: string;
        contributionPercent: number;
    }[];  
}

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    media: {
        name: string;
        url: string;
        mimeType: string;
    }[];  
    attributes: {
        key: string;
        value: string;
    }[]; 
}
