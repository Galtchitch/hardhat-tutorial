import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

const CONTRACT_ADDRESS = "0xYourContractAddressHere"; // Replace with your deployed contract address
const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

function App() {
  const [tokenId, setTokenId] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [owner, setOwner] = useState('');

  async function fetchNFT() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    try {
      const uri = await contract.tokenURI(tokenId);
      const ownerAddress = await contract.ownerOf(tokenId);
      setTokenURI(uri);
      setOwner(ownerAddress);
    } catch (error) {
      console.error("Error fetching NFT:", error);
      alert("Failed to fetch NFT. Make sure the token ID exists.");
    }
  }

  return (
    <div className="App">
      <h1>Retrieve NFT</h1>
      <label>
        Token ID:
        <input
          type="text"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </label>
      <button onClick={fetchNFT}>Fetch NFT</button>

      {tokenURI && (
        <div>
          <h2>NFT Details</h2>
          <p><strong>Token URI:</strong> {tokenURI}</p>
          <p><strong>Owner:</strong> {owner}</p>
        </div>
      )}
    </div>
  );
}

export default App;
