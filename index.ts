import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { ValidDepthSizePair } from "@solana/spl-account-compression";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import { CreateMetadataAccountArgsV3 } from "@metaplex-foundation/mpl-token-metadata";
import { createCollection, createTree, mintCompressedNFT } from "./scripts/index";

(async()=>{

    const collectionName = "Test";
    const collectionSymbol = "TEST";
    const nftName = "TEST V1";
    const metadataUri = "https://supersweetcollection.notarealurl/collection.json";
    const connection = new Connection("https://api.devnet.solana.com/");
    const nftMetadataUri = "https://supersweetcollection.notarealurl/token.json";


    //* payer should be replaced by the collection owner
    const payer = Keypair.fromSecretKey(
            new Uint8Array(JSON.parse("[72,112,40,218,181,68,47,102,143,13,241,5,65,28,72,20,70,51,194,91,36,130,19,115,221,193,177,131,182,81,85,202,35,142,181,24,232,206,32,248,194,184,145,171,110,42,44,82,160,184,214,35,142,65,193,255,38,43,87,85,14,113,11,217]"))
    )
    //* receiver can be users
    const reciever = new PublicKey("8Wkd1h4QCtBM7bY4hmCGRZwuxYwsJA5SEMaLaPREBu5o");

    //* tree creation started
    const maxDepthSizePair: ValidDepthSizePair = {
        maxDepth: 14,
        maxBufferSize: 64,
      };
      const canopyDepth = maxDepthSizePair.maxDepth - 5;

    
      // define the address the tree will live at
      const treeKeypair = Keypair.generate();
    
      // create and send the transaction to create the tree on chain
    const tree = await createTree(connection, payer, treeKeypair, maxDepthSizePair, canopyDepth);
    //* tree creation finished


    //* collection creation started
    const collectionMetadataV3: CreateMetadataAccountArgsV3 = {
        data: {
          name: collectionName,
          symbol: collectionSymbol,
          // specific json metadata for the collection
          uri: metadataUri,
          sellerFeeBasisPoints: 100,
          creators: [
            {
              address: payer.publicKey,
              verified: false,
              share: 100,
            },
          ],
          collection: null,
          uses: null,
        },
        isMutable: false,
        collectionDetails: null,
      };
    
      // create a full token mint and initialize the collection (with the `payer` as the authority)
      const collection = await createCollection(connection, payer, collectionMetadataV3);
      //* collection creation finished

      //* minting compressed nft

      const compressedNFTMetadata: MetadataArgs = {
        name: nftName,
        symbol: collectionMetadataV3.data.symbol,
        // specific json metadata for each NFT
        uri: nftMetadataUri,
        creators: [
          {
            address: payer.publicKey,
            verified: false,
            share: 100,
          },
          {
            address: reciever,
            verified: false,
            share: 0,
          },
        ],
        editionNonce: 0,
        uses: null,
        collection: null,
        primarySaleHappened: false,
        sellerFeeBasisPoints: 0,
        isMutable: false,
        // these values are taken from the Bubblegum package
        tokenProgramVersion: TokenProgramVersion.Original,
        tokenStandard: TokenStandard.NonFungible,
      };
    
      await mintCompressedNFT(
        connection,
        payer,
        treeKeypair.publicKey,
        collection.mint,
        collection.metadataAccount,
        collection.masterEditionAccount,
        compressedNFTMetadata,
        // mint to this specific wallet (in this case, the tree owner aka `payer`)
        payer.publicKey,
      );

      console.log(`Minting a single compressed NFT to ${reciever.toBase58()}...`);

})();
