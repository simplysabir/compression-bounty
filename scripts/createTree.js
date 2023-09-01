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
exports.createTree = void 0;
var web3_js_1 = require("@solana/web3.js");
var spl_account_compression_1 = require("@solana/spl-account-compression");
var helper_1 = require("../utils/helper");
var mpl_bubblegum_1 = require("@metaplex-foundation/mpl-bubblegum");
function createTree(connection, payer, treeKeypair, maxDepthSizePair, canopyDepth) {
    if (canopyDepth === void 0) { canopyDepth = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, treeAuthority, _bump, allocTreeIx, createTreeIx, tx, txSignature, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Creating a new Merkle tree...");
                    console.log("treeAddress:", treeKeypair.publicKey.toBase58());
                    _a = web3_js_1.PublicKey.findProgramAddressSync([treeKeypair.publicKey.toBuffer()], mpl_bubblegum_1.PROGRAM_ID), treeAuthority = _a[0], _bump = _a[1];
                    console.log("treeAuthority:", treeAuthority.toBase58());
                    return [4 /*yield*/, (0, spl_account_compression_1.createAllocTreeIx)(connection, treeKeypair.publicKey, payer.publicKey, maxDepthSizePair, canopyDepth)];
                case 1:
                    allocTreeIx = _b.sent();
                    createTreeIx = (0, mpl_bubblegum_1.createCreateTreeInstruction)({
                        payer: payer.publicKey,
                        treeCreator: payer.publicKey,
                        treeAuthority: treeAuthority,
                        merkleTree: treeKeypair.publicKey,
                        compressionProgram: spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
                        // NOTE: this is used for some on chain logging
                        logWrapper: spl_account_compression_1.SPL_NOOP_PROGRAM_ID,
                    }, {
                        maxBufferSize: maxDepthSizePair.maxBufferSize,
                        maxDepth: maxDepthSizePair.maxDepth,
                        public: false,
                    }, mpl_bubblegum_1.PROGRAM_ID);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    tx = new web3_js_1.Transaction().add(allocTreeIx).add(createTreeIx);
                    tx.feePayer = payer.publicKey;
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, 
                        // ensuring the `treeKeypair` PDA and the `payer` are BOTH signers
                        [treeKeypair, payer], {
                            commitment: "confirmed",
                            skipPreflight: true,
                        })];
                case 3:
                    txSignature = _b.sent();
                    console.log("\nMerkle tree created successfully!");
                    console.log((0, helper_1.explorerURL)({ txSignature: txSignature }));
                    // return useful info
                    return [2 /*return*/, { treeAuthority: treeAuthority, treeAddress: treeKeypair.publicKey }];
                case 4:
                    err_1 = _b.sent();
                    console.error("\nFailed to create merkle tree:", err_1);
                    // log a block explorer link for the failed transaction
                    return [4 /*yield*/, (0, helper_1.extractSignatureFromFailedTransaction)(connection, err_1)];
                case 5:
                    // log a block explorer link for the failed transaction
                    _b.sent();
                    throw err_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.createTree = createTree;
