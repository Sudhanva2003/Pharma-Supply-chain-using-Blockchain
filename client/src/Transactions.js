import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import "./transactions.css"; // Import the updated CSS file

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [entityNames, setEntityNames] = useState({});
    const [loader, setLoader] = useState(true);
    const [currentAccount, setCurrentAccount] = useState('');
    const contractAddress = '0xB9065eaF6E16613bd765b1F1F21Aa30145F1b8A4'; // Contract address

    useEffect(() => {
        const loadData = async () => {
            await loadBlockchainData();
        };

        loadData();
    }, []);

    const loadBlockchainData = async () => {
        setLoader(true);
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];

        if (networkData) {
            const supplyChain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);

            // Fetch all entity names
            const entityNames = await fetchEntityNames(supplyChain);
            setEntityNames(entityNames);

            // Fetch transactions and filter for PaymentMade events
            const transactionData = await fetchTransactions(web3, supplyChain, entityNames);
            setTransactions(transactionData);
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }

        setLoader(false);
    };

    const fetchEntityNames = async (supplyChain) => {
        const manufacturers = {};
        const shippingAgents = {};
        const distributors = {};
        const warehouseAgents = {};

        const manufacturerCount = await supplyChain.methods.manCtr().call();
        const shippingAgentCount = await supplyChain.methods.shipCtr().call();
        const distributorCount = await supplyChain.methods.disCtr().call();
        const warehouseAgentCount = await supplyChain.methods.warCtr().call();

        for (let i = 1; i <= manufacturerCount; i++) {
            const manufacturer = await supplyChain.methods.MAN(i).call();
            manufacturers[manufacturer.addr] = `Manufacturer: ${manufacturer.name}`;
        }

        for (let i = 1; i <= shippingAgentCount; i++) {
            const shippingAgent = await supplyChain.methods.SHIP(i).call();
            shippingAgents[shippingAgent.addr] = `Shipping Agent: ${shippingAgent.name}`;
        }

        for (let i = 1; i <= distributorCount; i++) {
            const distributor = await supplyChain.methods.DIS(i).call();
            distributors[distributor.addr] = `Distributor: ${distributor.name}`;
        }

        for (let i = 1; i <= warehouseAgentCount; i++) {
            const warehouseAgent = await supplyChain.methods.WAR(i).call();
            warehouseAgents[warehouseAgent.addr] = `Warehouse Agent: ${warehouseAgent.name}`;
        }

        return {
            ...manufacturers,
            ...shippingAgents,
            ...distributors,
            ...warehouseAgents,
            [contractAddress]: 'Contract'
        };
    };

    const fetchTransactions = async (web3, supplyChain, entityNames) => {
        const events = await supplyChain.getPastEvents('PaymentMade', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        return Promise.all(events.map(async (event) => {
            const fromName = entityNames[event.returnValues.from] || 'Contract';
            const toName = entityNames[event.returnValues.to] || 'Contract';

            // Get block timestamp
            const block = await web3.eth.getBlock(event.blockNumber);

            return {
                id: event.id,
                transactionHash: event.transactionHash,
                event: event.event,
                from: event.returnValues.from,
                to: event.returnValues.to,
                fromName,
                toName,
                amount: Web3.utils.fromWei(event.returnValues.amount, 'ether'), // Convert Wei to Ether
                productId: event.returnValues.productId,
                stage: event.returnValues.stage,
                blockNumber: event.blockNumber,
                timestamp: new Date(block.timestamp * 1000).toLocaleString() // Convert timestamp from seconds to local date string
            };
        }));
    };

    return (
        <div>
            {loader ? <p className="loading">Loading...</p> : (
                <div>
                    <table className="table">
                        <thead>
                            <tr className="tableHeader">
                                <th className="tableHeaderCell">Transaction Hash</th>
                                <th className="tableHeaderCell">From</th>
                                <th className="tableHeaderCell">To</th>
                                <th className="tableHeaderCell">Amount (ETH)</th>
                                <th className="tableHeaderCell">Product ID</th>
                                <th className="tableHeaderCell">Stage</th>
                                <th className="tableHeaderCell">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.transactionHash} className="tableRow">
                                    <td className="tableCell">{tx.transactionHash}</td>
                                    <td className="tableCell">{tx.fromName} ({tx.from})</td>
                                    <td className="tableCell">{tx.toName} ({tx.to})</td>
                                    <td className="tableCell">{tx.amount}</td>
                                    <td className="tableCell">{tx.productId}</td>
                                    <td className="tableCell">{tx.stage}</td>
                                    <td className="tableCell">{tx.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Transactions;
