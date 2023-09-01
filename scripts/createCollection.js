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
exports.createCollection = void 0;
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
var helper_1 = require("../utils/helper");
function createCollection(connection, payer, metadataV3) {
    return __awaiter(this, void 0, void 0, function () {
        var mint, tokenAccount, mintSig, _a, metadataAccount, _bump, createMetadataIx, _b, masterEditionAccount, _bump2, createMasterEditionIx, collectionSizeIX, tx, txSignature, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // create and initialize the SPL token mint
                    console.log("Creating the collection's mint...");
                    return [4 /*yield*/, (0, spl_token_1.createMint)(connection, payer, 
                        // mint authority
                        payer.publicKey, 
                        // freeze authority
                        payer.publicKey, 
                        // decimals - use `0` for NFTs since they are non-fungible
                        0)];
                case 1:
                    mint = _c.sent();
                    console.log("Mint address:", mint.toBase58());
                    // create the token account
                    console.log("Creating a token account...");
                    return [4 /*yield*/, (0, spl_token_1.createAccount)(connection, payer, mint, payer.publicKey)];
                case 2:
                    tokenAccount = _c.sent();
                    console.log("Token account:", tokenAccount.toBase58());
                    // mint 1 token ()
                    console.log("Minting 1 token for the collection...");
                    return [4 /*yield*/, (0, spl_token_1.mintTo)(connection, payer, mint, tokenAccount, payer, 
                        // mint exactly 1 token
                        1, 
                        // no `multiSigners`
                        [], undefined, spl_token_1.TOKEN_PROGRAM_ID)];
                case 3:
                    mintSig = _c.sent();
                    _a = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("metadata", "utf8"), mpl_token_metadata_1.PROGRAM_ID.toBuffer(), mint.toBuffer()], mpl_token_metadata_1.PROGRAM_ID), metadataAccount = _a[0], _bump = _a[1];
                    console.log("Metadata account:", metadataAccount.toBase58());
                    createMetadataIx = (0, mpl_token_metadata_1.createCreateMetadataAccountV3Instruction)({
                        metadata: metadataAccount,
                        mint: mint,
                        mintAuthority: payer.publicKey,
                        payer: payer.publicKey,
                        updateAuthority: payer.publicKey,
                    }, {
                        createMetadataAccountArgsV3: metadataV3,
                    });
                    _b = web3_js_1.PublicKey.findProgramAddressSync([
                        Buffer.from("metadata", "utf8"),
                        mpl_token_metadata_1.PROGRAM_ID.toBuffer(),
                        mint.toBuffer(),
                        Buffer.from("edition", "utf8"),
                    ], mpl_token_metadata_1.PROGRAM_ID), masterEditionAccount = _b[0], _bump2 = _b[1];
                    console.log("Master edition account:", masterEditionAccount.toBase58());
                    createMasterEditionIx = (0, mpl_token_metadata_1.createCreateMasterEditionV3Instruction)({
                        edition: masterEditionAccount,
                        mint: mint,
                        mintAuthority: payer.publicKey,
                        payer: payer.publicKey,
                        updateAuthority: payer.publicKey,
                        metadata: metadataAccount,
                    }, {
                        createMasterEditionArgs: {
                            maxSupply: 0,
                        },
                    });
                    collectionSizeIX = (0, mpl_token_metadata_1.createSetCollectionSizeInstruction)({
                        collectionMetadata: metadataAccount,
                        collectionAuthority: payer.publicKey,
                        collectionMint: mint,
                    }, {
                        setCollectionSizeArgs: { size: 50 },
                    });
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 8]);
                    tx = new web3_js_1.Transaction()
                        .add(createMetadataIx)
                        .add(createMasterEditionIx)
                        .add(collectionSizeIX);
                    tx.feePayer = payer.publicKey;
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [payer], {
                            commitment: "confirmed",
                            skipPreflight: true,
                        })];
                case 5:
                    txSignature = _c.sent();
                    console.log("\nCollection successfully created!");
                    console.log((0, helper_1.explorerURL)({ txSignature: txSignature }));
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _c.sent();
                    console.error("\nFailed to create collection:", err_1);
                    // log a block explorer link for the failed transaction
                    return [4 /*yield*/, (0, helper_1.extractSignatureFromFailedTransaction)(connection, err_1)];
                case 7:
                    // log a block explorer link for the failed transaction
                    _c.sent();
                    throw err_1;
                case 8: 
                // return all the accounts
                return [2 /*return*/, { mint: mint, tokenAccount: tokenAccount, metadataAccount: metadataAccount, masterEditionAccount: masterEditionAccount }];
            }
        });
    });
}
exports.createCollection = createCollection;
