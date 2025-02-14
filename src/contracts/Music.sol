// Music.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IPAssetRegistry } from "@storyprotocol/core/registries/IPAssetRegistry.sol";
import { LicenseRegistry } from "@storyprotocol/core/registries/LicenseRegistry.sol";
import { PILicenseTemplate } from "@storyprotocol/core/modules/licensing/PILicenseTemplate.sol";
import { PILTerms } from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import { LicensingModule } from "@storyprotocol/core/modules/licensing/LicensingModule.sol";
import { RoyaltyPolicyLAP } from "@storyprotocol/core/modules/royalty/policies/LAP/RoyaltyPolicyLAP.sol";
import { MockERC20 } from "@storyprotocol/test/mocks/token/MockERC20.sol";
import { LicenseToken } from "@storyprotocol/core/LicenseToken.sol";
import { RoyaltyWorkflows } from "@storyprotocol/periphery/workflows/RoyaltyWorkflows.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract Music is ERC721, ERC721URIStorage, Ownable, AccessControl {

    uint256 public nextTokenId;
    IPAssetRegistry public ipAssetRegistry;
    LicenseRegistry public licenseRegistry;
    LicensingModule public licensingModule;
    PILicenseTemplate public piLicenseTemplate;
    RoyaltyPolicyLAP public royaltyPolicy;
    MockERC20 public mockERC20;
    LicenseToken public licenseToken;
    RoyaltyWorkflows public royaltyWorkflows;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(uint256 => address) public ipIds;
    mapping(uint256 => MusicData) public musicRegistry;
    mapping(uint256 => address) public royaltiesRecipient;
    
    struct MusicData {
        string title;
        string description;
        string artist;
        string genre;
        string ipfsHash;
        uint256 licenseFee;
        string metadataURI;
    }

event MusicRegistered(

    string title,
    string artist,
    string description,
    string genre,
    string ipfsHash,
    uint256 licenseFee,
    string metadataURI
);

    constructor(
        string memory name,
        string memory symbol,
        address _ipAssetRegistry,
        address _licenseRegistry,
        address _licensingModule,
        address _piLicenseTemplate,
        address _royaltyPolicy,
        address _mockERC20,
        address _licenseToken,
        address _royaltyWorkflows
    ) ERC721(name, symbol) ERC721URIStorage() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        ipAssetRegistry = IPAssetRegistry(_ipAssetRegistry);
        licenseRegistry = LicenseRegistry(_licenseRegistry);
        licensingModule = LicensingModule(_licensingModule);
        piLicenseTemplate = PILicenseTemplate(_piLicenseTemplate);
        royaltyPolicy = RoyaltyPolicyLAP(_royaltyPolicy);
        mockERC20 = MockERC20(_mockERC20);
        licenseToken = LicenseToken(_licenseToken);
        royaltyWorkflows = RoyaltyWorkflows(_royaltyWorkflows);
    }

    function grantRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not admin");
        _grantRole(role, account);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getNextTokenId() public view returns (uint256) {
        return nextTokenId;
    }

   function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
    }

    function mint(address to) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }

    function grantMinterRole(address account) public onlyOwner {
        _grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) public onlyOwner {
        _revokeRole(MINTER_ROLE, account);
    }

function mintMusicNFT(
    string memory title,
    string memory description,
    string memory artist,
    string memory genre,
    string memory ipfsHash,
    uint256 licenseFee,
    string memory metadataURI
) public returns (uint256) {
    uint256 newTokenId = nextTokenId++;

    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, metadataURI);

        musicRegistry[newTokenId] = MusicData(title, description, artist, genre, ipfsHash, licenseFee, metadataURI);
        royaltiesRecipient[newTokenId] = msg.sender;

        emit MusicRegistered(newTokenId, title, description, artist, genre, ipfsHash, licenseFee, metadataURI);
        return newTokenId;
    }


    function registerAsIPAsset(uint256 tokenId) public returns (address ipId) {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        ipId = ipAssetRegistry.register(block.chainid, address(this), tokenId);
        ipIds[tokenId] = ipId;
    }

    function registerLicenseTerms() public returns (uint256 licenseTermsId) {
        PILTerms memory pilTerms = PILTerms({
            transferable: true,
            royaltyPolicy: address(royaltyPolicy),
            defaultMintingFee: 0,
            expiration: 0,
            commercialUse: true,
            commercialAttribution: true,
            commercializerChecker: address(0),
            commercializerCheckerData: "",
            commercialRevShare: 10 * 10**6, // 10%
            commercialRevCeiling: 0,
            derivativesAllowed: true,
            derivativesAttribution: true,
            derivativesApproval: true,
            derivativesReciprocal: true,
            derivativeRevCeiling: 0,
            currency: address(mockERC20),
            uri: ""
        });
        licenseTermsId = piLicenseTemplate.registerLicenseTerms(pilTerms);
    }

    function attachLicenseTerms(uint256 tokenId, uint256 licenseTermsId) public {
        address ipId = ipIds[tokenId];
        require(ipId != address(0), "IP Asset not registered");
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");

        licensingModule.attachLicenseTerms(ipId, address(piLicenseTemplate), licenseTermsId);
    }

    function mintLicenseToken(uint256 tokenId, uint256 licenseTermsId, uint256 amount, address receiver) public {
        address ipId = ipIds[tokenId];
        require(ipId != address(0), "IP Asset not registered");
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");

        licensingModule.mintLicenseTokens({
            licensorIpId: ipId,
            licenseTemplate: address(piLicenseTemplate),
            licenseTermsId: licenseTermsId,
            amount: amount,
            receiver: receiver,
            royaltyContext: "",
            maxMintingFee: 0,
            maxRevenueShare: 0
        });
    }

    function registerDerivativeWithLicenseToken(uint256 parentTokenId, uint256 childTokenId, uint256 licenseTokenId) public {
        address parentIpId = ipIds[parentTokenId];
        address childIpId = ipIds[childTokenId];
        require(parentIpId != address(0), "Parent IP not registered");
        require(childIpId != address(0), "Child IP not registered");
        require(ownerOf(childTokenId) == msg.sender, "Caller is not the owner");

        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = licenseTokenId;

        licensingModule.registerDerivativeWithLicenseTokens({
            childIpId: childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext: "",
            maxRts: 0
        });
    }
    
    function mintLicenseTokenAndRegisterDerivative(
        address parentIpId,
        uint256 licenseTermsId,
        address receiver
    ) external returns (uint256 childTokenId, address childIpId) {
        childTokenId = mint(address(this));
        childIpId = ipAssetRegistry.register(block.chainid, address(this), childTokenId);

        uint256 licenseTokenId = licensingModule.mintLicenseTokens({
            licensorIpId: parentIpId,
            licenseTemplate: address(piLicenseTemplate),
            licenseTermsId: licenseTermsId,
            amount: 1,
            receiver: address(this),
            royaltyContext: "",
            maxMintingFee: 0,
            maxRevenueShare: 0
        });

        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = licenseTokenId;

        licensingModule.registerDerivativeWithLicenseTokens({
            childIpId: childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext: "",
            maxRts: 0
        });

        _transfer(address(this), receiver, childTokenId);
    }

    function claimRoyalty(uint256 parentTokenId, uint256 childTokenId) public {
        address parentIpId = ipIds[parentTokenId];
        address childIpId = ipIds[childTokenId];
        require(parentIpId != address(0), "Parent IP not registered");
        require(childIpId != address(0), "Child IP not registered");

        address[] memory childIpIds = new address[](1);
        address[] memory royaltyPolicies = new address[](1);
        address[] memory currencyTokens = new address[](1);
        childIpIds[0] = childIpId;
        royaltyPolicies[0] = address(royaltyPolicy);
        currencyTokens[0] = address(mockERC20);

        royaltyWorkflows.claimAllRevenue({
            ancestorIpId: parentIpId,
            claimer: ownerOf(parentTokenId),
            childIpIds: childIpIds,
            royaltyPolicies: royaltyPolicies,
            currencyTokens: currencyTokens
        });
    }
    
    function setUp() public {
        nextTokenId = 0;
    }
}
