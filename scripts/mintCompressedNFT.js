"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintCompressedNFT = void 0;
var mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
var web3_js_1 = require("@solana/web3.js");
var spl_account_compression_1 = require("@solana/spl-account-compression");
var helper_1 = require("../utils/helper");
var mpl_bubblegum_1 = require("@metaplex-foundation/mpl-bubblegum");
function mintCompressedNFT(connection, payer, treeAddress, collectionMint, collectionMetadata, collectionMasterEditionAccount, compressedNFTMetadata, receiverAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, treeAuthority, _bump, _b, bubblegumSigner, _bump2, mintIxs, tx, txSignature, err_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = web3_js_1.PublicKey.findProgramAddressSync([treeAddress.toBuffer()], mpl_bubblegum_1.PROGRAM_ID), treeAuthority = _a[0], _bump = _a[1];
                    _b = web3_js_1.PublicKey.findProgramAddressSync(
                    // `collection_cpi` is a custom prefix required by the Bubblegum program
                    [Buffer.from("collection_cpi", "utf8")], mpl_bubblegum_1.PROGRAM_ID), bubblegumSigner = _b[0], _bump2 = _b[1];
                    mintIxs = [];
                    /*
                      Add a single mint instruction
                      ---
                      But you could all multiple in the same transaction, as long as your
                      transaction is still within the byte size limits
                    */
                    mintIxs.push((0, mpl_bubblegum_1.createMintToCollectionV1Instruction)({
                        payer: payer.publicKey,
                        merkleTree: treeAddress,
                        treeAuthority: treeAuthority,
                        treeDelegate: payer.publicKey,
                        // set the receiver of the NFT
                        leafOwner: receiverAddress || payer.publicKey,
                        // set a delegated authority over this NFT
                        leafDelegate: payer.publicKey,
                        /*
                            You can set any delegate address at mint, otherwise should
                            normally be the same as `leafOwner`
                            NOTE: the delegate will be auto cleared upon NFT transfer
                            ---
                            in this case, we are setting the payer as the delegate
                          */
                        // collection details
                        collectionAuthority: payer.publicKey,
                        collectionAuthorityRecordPda: mpl_bubblegum_1.PROGRAM_ID,
                        collectionMint: collectionMint,
                        collectionMetadata: collectionMetadata,
                        editionAccount: collectionMasterEditionAccount,
                        // other accounts
                        compressionProgram: spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
                        logWrapper: spl_account_compression_1.SPL_NOOP_PROGRAM_ID,
                        bubblegumSigner: bubblegumSigner,
                        tokenMetadataProgram: mpl_token_metadata_1.PROGRAM_ID,
                    }, {
                        metadataArgs: Object.assign(compressedNFTMetadata, {
                            collection: { key: collectionMint, verified: false },
                        }),
                    }));
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 5]);
                    tx = (_c = new web3_js_1.Transaction()).add.apply(_c, mintIxs);
                    tx.feePayer = payer.publicKey;
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [payer], {
                            commitment: "confirmed",
                            skipPreflight: true,
                        })];
                case 2:
                    txSignature = _d.sent();
                    console.log("\nSuccessfully minted the compressed NFT!");
                    console.log((0, helper_1.explorerURL)({ txSignature: txSignature }));
                    return [2 /*return*/, txSignature];
                case 3:
                    err_1 = _d.sent();
                    console.error("\nFailed to mint compressed NFT:", err_1);
                    // log a block explorer link for the failed transaction
                    return [4 /*yield*/, (0, helper_1.extractSignatureFromFailedTransaction)(connection, err_1)];
                case 4:
                    // log a block explorer link for the failed transaction
                    _d.sent();
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.mintCompressedNFT = mintCompressedNFT;
