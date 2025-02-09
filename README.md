# 🎵 Music IP Registration

This project provides a system for registering music IP using Story Protocol and IPFS. It allows artists to securely register and store metadata of their music on the blockchain.

## 🚀 Features
- Upload music files to IPFS
- Register music metadata on the blockchain
- Generate NFT metadata for ownership representation
- Uses Story Protocol for IP registration
- Music generated using [Suno](https://suno.com)

---

## 📁 Folder Structure
```
music-ip-registration/
│── src/
│   │── config/
│   │   ├── storyClient.ts
│   │   ├── env.ts
│   │── utils/
│   │   ├── ipfs.ts
│   │   ├── logger.ts
│   │── models/
│   │   ├── metadata.ts
│   │── services/
│   │   ├── registerMusic.ts
│   │── contracts/                   
│   │   ├── Music.sol                  
│   │── index.ts
│── logs/
│   │── app.log
│── music/
│   │── Dawn.mp3
│   │── Dusk.mp3    
│   │── Yi.mp3
│   │── YiLongMa.mp3
│── test/                            
│   │── Music.t.sol                      
│── deploy/                            
│   │── deployMusicNFT.ts              
│── node_modules/
│── package.json
│── tsconfig.json
│── foundry.toml                        
│── remappings.txt                      
│── .env.example
│── .gitignore
│── README.md
```
---

## 🛠 Installation and Setup

### 1️⃣ Clone the Repository
```
 git clone https://github.com/naufalprtm/storyprotocol-music.git
```
### 2️⃣ Install Dependencies
```
 npm install
```
### 3️⃣ Configure Environment
```
Set up your .env file with the necessary API keys and configurations.
```
### 🚀 Deployment and Testing

#### Build the Project
```
 forge clean
 forge build
```
#### Run Tests
```
 forge test -vvv
```
#### Deploy the Smart Contract
```
 forge create --rpc-url https://aeneid.storyrpc.io \
    --private-key your_private_key_here \
    src/contracts/MusicNFT.sol:MusicNFT
```
#### Run Forked Tests
```
 forge test --fork-url https://aeneid.storyrpc.io/ --match-path test/Music.t.sol -vvv
```
#### Verify the Smart Contract
```
 forge create \
  --rpc-url https://aeneid.storyrpc.io/ \
  --private-key $PRIVATE_KEY \
  ./src/Example.sol:Example \
  --verify \
  --verifier blockscout \
  --verifier-url https://aeneid.storyscan.xyz/api/ \
  --constructor-args 0x0 0x0 0x0 0x0 0x0
```

## 🎼 Music Source  
The music files in this project were generated using [Suno](https://suno.com).  

Let me know if you need any further edits! 🚀🎶