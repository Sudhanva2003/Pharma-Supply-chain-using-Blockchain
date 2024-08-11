import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainABI from './artifacts/SupplyChain.json';
import './track.css'; // Import a CSS file for custom styles

function Track() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [supplyChain, setSupplyChain] = useState();
    const [medData, setMedData] = useState({});
    const [id, setId] = useState("");

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    };

    const loadBlockchainData = async () => {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }
    };

    const handleTrack = async (event) => {
        event.preventDefault();
        try {
            const productId = parseInt(id, 10);
            if (isNaN(productId)) {
                throw new Error("Invalid Product ID");
            }

            // Fetch the medicine data
            const product = await supplyChain.methods.MedicineStock(productId).call();
            const stage = await supplyChain.methods.showStage(productId).call();
            
            setMedData({
                ...product,
                stage
            });
        } catch (error) {
            console.error("Error tracking the product:", error);
        }
    };

    return (
        <div className="track-container">
            <h1 className="header">Track Medicine</h1>
            <form onSubmit={handleTrack} className="track-form">
                <div className="form-group">
                    <label htmlFor="ID">Product ID:</label>
                    <input
                        type="text"
                        id="ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="form-control"
                        placeholder="Enter Product ID"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Track Product</button>
            </form>

            {medData.id && (
                <div className="med-data">
                    <h3>Product Details:</h3>
                    <ul>
                        <li><strong>ID:</strong> {medData.id}</li>
                        <li><strong>Name:</strong> {medData.name}</li>
                        <li><strong>Price:</strong> {Web3.utils.fromWei(medData.price, 'ether')} Ether</li>
                        <li><strong>Quantity:</strong> {medData.quantity}</li>
                        <li><strong>Expiration Date:</strong> {new Date(medData.expirationDate * 1000).toLocaleDateString()}</li>
                        <li><strong>Current Stage:</strong> {medData.stage}</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Track;
