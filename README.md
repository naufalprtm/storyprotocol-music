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
│──  music/
│   ├──Dawn.mp3
│   ├── Dusk.mp3    
│   ├── Yi.mp3
│   ├── YiLongMa.mp3             
│── logs/
│   │── app.log
│── test/                            
│   │── Music.t.sol    
├── index.ts                              
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
#### Run Forked Tests
```
 forge test --fork-url https://aeneid.storyrpc.io/ --match-path test/Music.t.sol -vvv
```
#### Deploy the Smart Contract & Verify the Smart Contract
Aeneid
```
forge create --broadcast --verify \
  --verifier blockscout \
  --verifier-url https://aeneid.storyscan.xyz/api/ \
  --rpc-url https://aeneid.storyrpc.io/ \
  --private-key your_private_key_here \
  ./src/contracts/Music.sol:Music \
  --constructor-args \
  Music MUSIC \
  0x77319B4031e6eF1250907aa00018B8B1c67a244b \
  0x529a750E02d8E2f15649c13D69a465286a780e24 \
  0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f \
  0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316 \
  0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E \
  0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E \
  0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC \
  0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890 
```

LocalTest
```
forge create --broadcast \
  --rpc-url http://127.0.0.1:8545/ \
  --private-key your_private_key_here \
  ./src/contracts/Music.sol:Music \
  --constructor-args \
  Music MUSIC \
  0x77319B4031e6eF1250907aa00018B8B1c67a244b \
  0x529a750E02d8E2f15649c13D69a465286a780e24 \
  0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f \
  0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316 \
  0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E \
  0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E \
  0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC \
  0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890 
```
#### Test Register
```
npx tsx index.ts
```
## 🎵 Smart Contract Interactions

### Mint Music NFT (mintMusicNFT)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "mintMusicNFT(string,string,string,string,uint256,string)" \
    "Sample Title" "Sample Artist" "Pop" "QmSampleIPFSHash" 100000000000000000 "https://ipfs.io/ipfs/Qasdsadas_or_dasdasdasd_(hash) from pinata"
```

### Register IP Asset (registerAsIPAsset)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "registerAsIPAsset(uint256)" 2
```

### Register License Terms (registerLicenseTerms)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "registerLicenseTerms()"
```

### Attach License Terms (attachLicenseTerms)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "attachLicenseTerms(uint256,uint256)" 1 1
```

### Mint License Token (mintLicenseToken)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "mintLicenseToken(uint256,uint256,uint256,address)" 1 1 1000000000000000000 your_wallet_here
```

### Claim Royalty (claimRoyalty)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "claimRoyalty(uint256,uint256)" 1 2
```

### Grant Role (manual casting)
```
cast send --rpc-url https://aeneid.storyrpc.io/ --private-key your_private_key_here \
    your_contract_here \
    "grantRole(bytes32,address)" \
    "0x0000000000000000000000000000000000000000000000000000000000000000" \
    your_wallet_here
```
check MINTER ROLE
```
cast keccak "MINTER_ROLE"
```

## 🔄 Reset and Reinstall
```
rm -rf node_modules package-lock.json dist .turbo
npm cache clean --force / yarn cache clean
npm install / yarn install

npx tsc --build --force
npx ts-node index.ts
npx tsx index.ts
```

#### Addresses from Story Protocol deployment
Official Docs `docs.story.foundation` [Deployed Smart Contracts](https://docs.story.foundation/docs/deployed-smart-contracts)

```
IPAssetRegistry internal IP_ASSET_REGISTRY = IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b); // Protocol Core - IPAssetRegistry
LicenseRegistry internal LICENSE_REGISTRY = LicenseRegistry(0x529a750E02d8E2f15649c13D69a465286a780e24); // Protocol Core - LicenseRegistry
LicensingModule internal LICENSING_MODULE = LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f); // Protocol Core - LicensingModule
PILicenseTemplate internal PIL_TEMPLATE = PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316); // Protocol Core - PILicenseTemplate
RoyaltyPolicyLAP internal ROYALTY_POLICY_LAP = RoyaltyPolicyLAP(0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E); // Protocol Core - RoyaltyPolicyLAP
LicenseToken internal LICENSE_TOKEN = LicenseToken(0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC); // Protocol Core - LicenseToken
RegistrationWorkflows internal REGISTRATION_WORKFLOWS = RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424); // Protocol Periphery 
RoyaltyModule internal ROYALTY_MODULE = RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086); // Protocol Core - RoyaltyModule
RoyaltyWorkflows internal ROYALTY_WORKFLOWS = RoyaltyWorkflows(0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890); // ProtocolPeripheryRoyaltyWorkflows
MockERC20 internal MERC20 = MockERC20(0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E); // Mock - MERC20
```
## 🎼 Music Source  
The music files in this project were generated using [Suno](https://suno.com).  

Let me know if you need any further edits! 🚀🎶