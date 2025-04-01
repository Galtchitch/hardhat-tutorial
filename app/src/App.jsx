import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function awardItem(address player, string memory tokenURI) public returns (uint256)",
];

function App() {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contractAddress, setcontractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [tokenMetadata, setTokenMetadata] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(() => {
    async function init() {
      let _provider, _signer;
      if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults")
        _provider = ethers.getDefaultProvider();
      } else {
        _provider = new ethers.BrowserProvider(window.ethereum);
        _signer = await _provider.getSigner();
      }
      setProvider(_provider);
      setSigner(_signer);
    }
    init();
  }, []);

  async function awardNFT() {
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    try {
      const tx = await contract.awardItem(signer.getAddress(), tokenURI);
      await tx.wait();
      console.log("NFT awarded successfully:", tx);
      alert("NFT awarded successfully!");
    } catch (error) {
      console.error("Error awarding NFT:", error);
      alert("Failed to award NFT. Make sure the token ID is valid.");
    }
  }

  async function fetchNFT() {
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    try {
      // Fetch tokenURI and owner address from the contract
      const uri = await contract.tokenURI(tokenId);
      const ownerAddress = await contract.ownerOf(tokenId);
      console.log("Token URI:", uri);
      console.log("Owner Address:", ownerAddress);
      // Fetch metadata from the tokenURI
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Failed to fetch metadata from tokenURI");
      }
      const metadata = await response.json();
      console.log("Metadata:", metadata);
      // Update state with metadata and owner
      setTokenURI(uri);
      setTokenMetadata(metadata); 
      setOwner(ownerAddress);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      alert("Failed to fetch NFT. Make sure the token ID exists and the tokenURI is valid.");
      setTokenURI("");
      setTokenMetadata(""); 
      setOwner("");
    }
  }

  return (
    <div className="App">
      <label>
        Contract address:
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setcontractAddress(e.target.value)}
        />
      </label>
      <br /><button onClick={awardNFT}>Award NFT</button>
      <br /><h1>Retrieve NFT</h1>
      <br /><label>
        Token ID:
        <input
          type="text"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </label>
      <br /><button onClick={fetchNFT}>Fetch NFT</button>
      {tokenURI && (
        <div>
          <h2>NFT Details</h2>
          <img src={tokenMetadata.image} width={100}/>
          <p><strong>Name:</strong> {tokenMetadata.name}</p>
          <p><strong>Strength:</strong> {tokenMetadata.strength}</p>
          <p><strong>Owner:</strong> {owner}</p>
        </div>
      )}
    </div>
  );
}

export default App;
