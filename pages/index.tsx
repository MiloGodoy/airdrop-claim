import { ConnectWallet, Web3Button, createMerkleTreeFromAllowList, getProofsForAllowListEntry, useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useState } from "react";
import { utils } from 'ethers';

const Home: NextPage = () => {
  const allowList = [
    {
      "address": "0x686702D92F8a9C9336703e0F2023dc54BD40c0A7",
      "maxClaimable": "100"
    },
    {
      "address": "0xb031D5CdDFAD201B73d70B02bA00BFB77B9eAe4c", 
      "maxClaimable": "100"
    },
    {
      "address": "0xD5402E546c6e6B51C0504c13AB1ffFd53368d2AA", 
      "maxClaimable": "100"
    },
  ];

  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  const generateMerkleTree = async () => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    setMerkleRoot(merkleTree.getHexRoot());
  }

  const getUserProof = async (address: string) => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    const leaf = {
      "address": address,
      "maxClaimable": "100"
    };
    const proof = await getProofsForAllowListEntry(merkleTree, leaf);
    //const proofHash = "0x" + proof[0].data.toString("hex");
    //const proofHash = "0x" + Buffer.from(proof).toString("hex");
    const proofHash = "0x" + Buffer.from(proof.join('')).toString("hex");


    return proofHash;
  }

  const address = useAddress();
  const { contract: tokenContract } = useContract("0x948c6eD8366CE793455D437AbDd7d3b168f65dCc"); 
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ConnectWallet />
        {address && (
          <div>
            <div style={{
              backgroundColor: '#222',
              padding: "2rem",
              borderRadius: "1rem",
              textAlign: "center",
              minWidth: "500px",
              marginBottom: "2rem",
              marginTop: "2rem",
            }}>
              <h1>Create Merkle Tree</h1>
              <button
                onClick={generateMerkleTree}
                style={{
                  padding: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#FFF",
                  color: "#333",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem0,"
                }}
              >
                Generate
              </button>
              {merkleRoot && (
                <p>Merkle Root Hash: {merkleRoot}</p>
              )}
            </div>
            <div style={{
              backgroundColor: '#222',
              padding: "2rem",
              borderRadius: "1rem",
              textAlign: "center",
              minWidth: "500px",
            }}>
              <h1>ERC-20 Airdrop</h1>
              <h3>Token Balance: {tokenBalance?.displayValue}</h3>
              <Web3Button
                contractAddress="0xc268Bf6edD03C60780c92aF01B7907B930Bff7CF"
                action={async (contract) => contract.call(
                  "claim",
                  [
                    address,
                    utils.parseEther("100"),
                    [await getUserProof(address)],
                    utils.parseEther("100"),
                  ]
                )}
                onError={() => alert("Not elegible for airdrop or already claimed!")}
                onSuccess={() => alert("Airdrop claimed!")}
              >Clain Airdrop</Web3Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;


//Merkle Root Hash: 0x274c1e0280c370f6616e5806523bf467025a83638bfec830ac04521fdd37e532