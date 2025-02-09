// Music.t.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import { Music } from "@Music/Music.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MockERC20 } from "@storyprotocol/test/mocks/token/MockERC20.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IPAssetRegistry } from "@storyprotocol/core/registries/IPAssetRegistry.sol";
import { PILicenseTemplate } from "@storyprotocol/core/modules/licensing/PILicenseTemplate.sol";
import { PILTerms } from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import { RoyaltyPolicyLAP } from "@storyprotocol/core/modules/royalty/policies/LAP/RoyaltyPolicyLAP.sol";
import { RoyaltyModule } from "@storyprotocol/core/modules/royalty/RoyaltyModule.sol";
import { RoyaltyWorkflows } from "@storyprotocol/periphery/workflows/RoyaltyWorkflows.sol";
import { LicensingModule } from "@storyprotocol/core/modules/licensing/LicensingModule.sol";
import { LicenseRegistry } from "@storyprotocol/core/registries/LicenseRegistry.sol";
import { LicenseToken } from "@storyprotocol/core/LicenseToken.sol";
import { RegistrationWorkflows } from "@storyprotocol/periphery/workflows/RegistrationWorkflows.sol";
import { WorkflowStructs } from "@storyprotocol/periphery/lib/WorkflowStructs.sol";
import { ISPGNFT } from "@storyprotocol/periphery/interfaces/ISPGNFT.sol";
import { PILFlavors } from "@storyprotocol/core/lib/PILFlavors.sol";


contract MusicTest is Test, IERC721Receiver {
    Music public nft;
    address public owner = address(this);
    address public user1 = address(0x123);
    address public user2 = address(0x456);

    // Addresses from Story Protocol deployment
    IPAssetRegistry internal IP_ASSET_REGISTRY = IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b); // Protocol Core - IPAssetRegistry
    LicenseRegistry internal LICENSE_REGISTRY = LicenseRegistry(0x529a750E02d8E2f15649c13D69a465286a780e24); // Protocol Core - LicenseRegistry
    LicensingModule internal LICENSING_MODULE = LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f); // Protocol Core - LicensingModule
    PILicenseTemplate internal PIL_TEMPLATE = PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316); // Protocol Core - PILicenseTemplate
    RoyaltyPolicyLAP internal ROYALTY_POLICY_LAP = RoyaltyPolicyLAP(0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E); // Protocol Core - RoyaltyPolicyLAP
    LicenseToken internal LICENSE_TOKEN = LicenseToken(0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC); // Protocol Core - LicenseToken
    RegistrationWorkflows internal REGISTRATION_WORKFLOWS = RegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424); // Protocol Periphery - RegistrationWorkflows
    RoyaltyModule internal ROYALTY_MODULE = RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086); // Protocol Core - RoyaltyModule
    RoyaltyWorkflows internal ROYALTY_WORKFLOWS = RoyaltyWorkflows(0x9515faE61E0c0447C6AC6dEe5628A2097aFE1890); // Protocol Periphery - RoyaltyWorkflows
    MockERC20 internal MERC20 = MockERC20(0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E); // Mock - MERC20

    Music public MUSIC;
    ISPGNFT public SPG_NFT;
    uint256 public licenseTermsId;
    address public ipId;
    uint256 public tokenId;
    uint256 public startLicenseTokenId;
    address public childIpId;
    function setUp() public {
        MUSIC = new Music(
            "MusicNFT",
            "MUSIC",
            address(IP_ASSET_REGISTRY),
            address(LICENSE_REGISTRY),
            address(LICENSING_MODULE),
            address(PIL_TEMPLATE),
            address(ROYALTY_POLICY_LAP),
            address(MERC20),
            address(LICENSE_TOKEN),
            address(ROYALTY_WORKFLOWS)
        );
        SPG_NFT = ISPGNFT(
            REGISTRATION_WORKFLOWS.createCollection(
                ISPGNFT.InitParams({
                    name: "Music",
                    symbol: "MUSIC",
                    baseURI: "",
                    contractURI: "",
                    maxSupply: 50,
                    mintFee: 0,
                    mintFeeToken: address(0),
                    mintFeeRecipient: address(this),
                    owner: address(this),
                    mintOpen: true,
                    isPublicMinting: false
                })
            )
        );
        tokenId = SPG_NFT.totalSupply() + 1;
        ipId = IP_ASSET_REGISTRY.ipId(block.chainid, address(SPG_NFT), tokenId);
        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = startLicenseTokenId;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function testMintNFT() public {
        uint256 tokenId = MUSIC.mint(owner);
        assertEq(MUSIC.ownerOf(tokenId), owner, "NFT should be minted to owner");
    }

    function test_mintAndRegisterIp() public {
        uint256 expectedTokenId = SPG_NFT.totalSupply() + 1;
        address expectedIpId = IP_ASSET_REGISTRY.ipId(block.chainid, address(SPG_NFT), expectedTokenId);

        (address ipId, uint256 tokenId) = REGISTRATION_WORKFLOWS.mintAndRegisterIp(
            address(SPG_NFT),
            owner,
            WorkflowStructs.IPMetadata({
                ipMetadataURI: "https://ipfs.io/ipfs/QmZHfQdFA2cb3ASdmeGS5K6rZjz65osUddYMURDx21bT73",
                ipMetadataHash: keccak256(
                    abi.encodePacked(
                        "{'title':'Music','description':'Music','ipType':'Music','relationships':[],'createdAt':'','watermarkImg':'https://picsum.photos/200','creators':[],'media':[],'attributes':[{'key':'Rarity','value':'Legendary'}],'tags':[]}"
                    )
                ),
                nftMetadataURI: "https://ipfs.io/ipfs/QmRL5PcK66J1mbtTZSw1nwVqrGxt98onStx6LgeHTDbEey",
                nftMetadataHash: keccak256(
                    abi.encodePacked(
                        "{'name':'Music','description':'Music','image':'https://picsum.photos/200'}"
                    )
                )
            }),
            true
        );

        assertEq(ipId, expectedIpId);
        assertEq(tokenId, expectedTokenId);
        assertEq(SPG_NFT.ownerOf(tokenId), owner);
    }

    function test_registerPILTerms() public {
        PILTerms memory pilTerms = PILTerms({
            transferable: true,
            royaltyPolicy: address(ROYALTY_POLICY_LAP),
            defaultMintingFee: 0,
            expiration: 0,
            commercialUse: true,
            commercialAttribution: true,
            commercializerChecker: address(0),
            commercializerCheckerData: "",
            commercialRevShare: 0,
            commercialRevCeiling: 0,
            derivativesAllowed: true,
            derivativesAttribution: true,
            derivativesApproval: true,
            derivativesReciprocal: true,
            derivativeRevCeiling: 0,
            currency: address(MERC20),
            uri: ""
        });

        licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(pilTerms);
        uint256 selectedLicenseTermsId = PIL_TEMPLATE.getLicenseTermsId(pilTerms);
        assertEq(licenseTermsId, selectedLicenseTermsId);
    }

    function test_attachLicenseTerms() public {
        vm.prank(owner);
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);

        assertTrue(LICENSE_REGISTRY.hasIpAttachedLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId));
        assertEq(LICENSE_REGISTRY.getAttachedLicenseTermsCount(ipId), 1);
        (address licenseTemplate, uint256 attachedLicenseTermsId) = LICENSE_REGISTRY.getAttachedLicenseTerms({
            ipId: ipId,
            index: 0
        });
        assertEq(licenseTemplate, address(PIL_TEMPLATE));
        assertEq(attachedLicenseTermsId, licenseTermsId);
    }

    function mintAndRegisterAndCreateTermsAndAttach(
        address receiver
    ) external returns (uint256 tokenId, address ipId, uint256 licenseTermsId) {
        tokenId = SPG_NFT.mint(address(this), "1", "https://ipfs.io/ipfs/xyz", false);
        ipId = IP_ASSET_REGISTRY.register(block.chainid, address(SPG_NFT), tokenId);

        licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(
            PILFlavors.commercialRemix({
                mintingFee: 0,
                commercialRevShare: 10 * 10 ** 6,
                royaltyPolicy: address(ROYALTY_POLICY_LAP),
                currencyToken: address(MERC20)
            })
        );
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);
        SPG_NFT.transferFrom(address(this), receiver, tokenId);
    }

   function test_registerDerivativeWithLicenseTokens() public {
        uint256 childTokenId = SPG_NFT.mint(address(this), "1", "https://ipfs.io/ipfs/xyz", false);
        address childIpId = IP_ASSET_REGISTRY.register(block.chainid, address(SPG_NFT), childTokenId);
        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = startLicenseTokenId;
        vm.prank(owner);
        LICENSING_MODULE.registerDerivativeWithLicenseTokens({
            childIpId: childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext: "", 
            maxRts: 0
        });
        assertTrue(LICENSE_REGISTRY.hasDerivativeIps(ipId));
        assertTrue(LICENSE_REGISTRY.isParentIp(ipId, childIpId));
        assertTrue(LICENSE_REGISTRY.isDerivativeIp(childIpId));
        assertEq(LICENSE_REGISTRY.getParentIpCount(childIpId), 1);
        assertEq(LICENSE_REGISTRY.getDerivativeIpCount(ipId), 1);
        assertEq(LICENSE_REGISTRY.getParentIp({ childIpId: childIpId, index: 0 }), ipId);
        assertEq(LICENSE_REGISTRY.getDerivativeIp({ parentIpId: ipId, index: 0 }), childIpId);
    }

    function test_mintLicenseToken() public {
        uint256 startLicenseTokenId = LICENSING_MODULE.mintLicenseTokens({
            licensorIpId: ipId,
            licenseTemplate: address(PIL_TEMPLATE),
            licenseTermsId: licenseTermsId,
            amount: 2,
            receiver: owner,
            royaltyContext: "",
            maxMintingFee: 0,
            maxRevenueShare: 0
        });
        assertEq(LICENSE_TOKEN.ownerOf(startLicenseTokenId), owner);
        assertEq(LICENSE_TOKEN.ownerOf(startLicenseTokenId + 1), owner);
    }

    function test_claimAllRevenue() public {
        MERC20.mint(address(this), 100);
        MERC20.approve(address(ROYALTY_MODULE), 10);
        ROYALTY_MODULE.payRoyaltyOnBehalf(childIpId, address(0), address(MERC20), 10);
        address[] memory childIpIds = new address[](1);
        address[] memory royaltyPolicies = new address[](1);
        address[] memory currencyTokens = new address[](1);
        childIpIds[0] = childIpId;
        royaltyPolicies[0] = address(ROYALTY_POLICY_LAP);
        currencyTokens[0] = address(MERC20);

        uint256[] memory amountsClaimed = ROYALTY_WORKFLOWS.claimAllRevenue({
            ancestorIpId: ipId,
            claimer: ipId,
            childIpIds: childIpIds,
            royaltyPolicies: royaltyPolicies,
            currencyTokens: currencyTokens
        });
        assertEq(amountsClaimed[0], 1);
        assertEq(MERC20.balanceOf(ipId), 1);
        assertEq(MERC20.balanceOf(ROYALTY_MODULE.ipRoyaltyVaults(childIpId)), 9);
    }
}