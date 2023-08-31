import {
    Keypair,
    PublicKey,
    Connection,
    Transaction,
    sendAndConfirmTransaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import {
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    createAllocTreeIx,
    ValidDepthSizePair,
    SPL_NOOP_PROGRAM_ID,
  } from "@solana/spl-account-compression";
  import { explorerURL, extractSignatureFromFailedTransaction } from "../utils/helper";
  import {
    PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
    MetadataArgs,
    createCreateTreeInstruction,
    createMintToCollectionV1Instruction,
  } from "@metaplex-foundation/mpl-bubblegum";


export async function createTree(
    connection: Connection,
    payer: Keypair,
    treeKeypair: Keypair,
    maxDepthSizePair: ValidDepthSizePair,
    canopyDepth: number = 0,
  ) {
    console.log("Creating a new Merkle tree...");
    console.log("treeAddress:", treeKeypair.publicKey.toBase58());
  
    // derive the tree's authority (PDA), owned by Bubblegum
    const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
      [treeKeypair.publicKey.toBuffer()],
      BUBBLEGUM_PROGRAM_ID,
    );
    console.log("treeAuthority:", treeAuthority.toBase58());
  
    // allocate the tree's account on chain with the `space`
    // NOTE: this will compute the space needed to store the tree on chain (and the lamports required to store it)
    const allocTreeIx = await createAllocTreeIx(
      connection,
      treeKeypair.publicKey,
      payer.publicKey,
      maxDepthSizePair,
      canopyDepth,
    );
  
    // create the instruction to actually create the tree
    const createTreeIx = createCreateTreeInstruction(
      {
        payer: payer.publicKey,
        treeCreator: payer.publicKey,
        treeAuthority,
        merkleTree: treeKeypair.publicKey,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        // NOTE: this is used for some on chain logging
        logWrapper: SPL_NOOP_PROGRAM_ID,
      },
      {
        maxBufferSize: maxDepthSizePair.maxBufferSize,
        maxDepth: maxDepthSizePair.maxDepth,
        public: false,
      },
      BUBBLEGUM_PROGRAM_ID,
    );
  
    try {
      // create and send the transaction to initialize the tree
      const tx = new Transaction().add(allocTreeIx).add(createTreeIx);
      tx.feePayer = payer.publicKey;
  
      // send the transaction
      const txSignature = await sendAndConfirmTransaction(
        connection,
        tx,
        // ensuring the `treeKeypair` PDA and the `payer` are BOTH signers
        [treeKeypair, payer],
        {
          commitment: "confirmed",
          skipPreflight: true,
        },
      );
  
      console.log("\nMerkle tree created successfully!");
      console.log(explorerURL({ txSignature }));
  
      // return useful info
      return { treeAuthority, treeAddress: treeKeypair.publicKey };
    } catch (err: any) {
      console.error("\nFailed to create merkle tree:", err);
  
      // log a block explorer link for the failed transaction
      await extractSignatureFromFailedTransaction(connection, err);
  
      throw err;
    }
  }