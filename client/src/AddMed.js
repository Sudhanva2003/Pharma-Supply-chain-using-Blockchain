import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import "./addMed.css";
import SupplyChainABI from "./artifacts/SupplyChain.json";

function AddMed() {
    const history = useHistory();

    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, []);

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [MED, setMED] = useState([]);
    const [MedName, setMedName] = useState("");
    const [MedPrice, setMedPrice] = useState("");
    const [MedQuantity, setMedQuantity] = useState("");
    const [MedExpiration, setMedExpiration] = useState("");
    const [MedStage, setMedStage] = useState([]);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                alert("You need to connect MetaMask!");
                console.error("MetaMask connection error:", error);
            }
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    };

    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        try {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            setCurrentaccount(account);
            const networkId = await web3.eth.net.getId();
            const networkData = SupplyChainABI.networks[networkId];
            if (networkData) {
                const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
                setSupplyChain(supplychain);
                const medCtr = await supplychain.methods.medicineCtr().call();
                const med = {};
                const medStage = [];
                for (let i = 0; i < medCtr; i++) {
                    med[i] = await supplychain.methods.MedicineStock(i + 1).call();
                    medStage[i] = await supplychain.methods.showStage(i + 1).call();
                }
                setMED(med);
                setMedStage(medStage);
            } else {
                window.alert('The smart contract is not deployed to the current network');
            }
        } catch (error) {
            console.error("Error loading blockchain data:", error);
            window.alert("Error loading blockchain data. Check the console for details.");
        } finally {
            setloader(false);
        }
    };

    const redirect_to_home = () => {
        history.push('/');
    };

    const convertDateToTimestamp = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
        }
        return Math.floor(date.getTime() / 1000);
    };

    const handlerSubmitMED = async (event) => {
        event.preventDefault();
        try {
            if (!SupplyChain) {
                throw new Error("Contract not loaded.");
            }

            // Convert price from Ether to Wei
            const priceInWei = Web3.utils.toWei(MedPrice, 'ether');

            const expirationTimestamp = convertDateToTimestamp(MedExpiration);

            const receipt = await SupplyChain.methods.addMedicine(
                MedName,
                priceInWei,
                MedQuantity,
                expirationTimestamp
            ).send({ from: currentaccount });

            if (receipt) {
                loadBlockchaindata();
            }
        } catch (err) {
            console.error("Error adding medicine:", err);
            alert("An error occurred!!! Check the console for details.");
        }
    };

    const formatExpirationDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert from Unix timestamp to milliseconds
        return date.toLocaleDateString(); // Display only date
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert from Unix timestamp to milliseconds
        return date.toLocaleString(); // Display date and time
    };

    return (
        <div className='container'>
            <span><b>Current Account Address:</b> {currentaccount}</span>
            <span onClick={redirect_to_home} className="btn btn-outline-danger btn-sm btn-home"> HOME</span>
            <br />
            <h4>Add products</h4>
            <form onSubmit={handlerSubmitMED}>
                <div className="form-group">
                    <input className="form-control" type="text" value={MedName} onChange={(e) => setMedName(e.target.value)} placeholder="Medicine Name" required />
                </div>
                <div className="form-group">
                    <input className="form-control" type="number" step="any" value={MedPrice} onChange={(e) => setMedPrice(e.target.value)} placeholder="Price (in Ether)" required />
                </div>
                <div className="form-group">
                    <input className="form-control" type="number" value={MedQuantity} onChange={(e) => setMedQuantity(e.target.value)} placeholder="Quantity" required />
                </div>
                <div className="form-group">
                    <input className="form-control" type="date" value={MedExpiration} onChange={(e) => setMedExpiration(e.target.value)} placeholder="Expiration Date" required />
                </div>
                <button type="submit" className="btn btn-outline-success btn-sm btn-order">Order</button>
            </form>
            <br />
            <h5>Ordered Products</h5>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Expiration Date</th>
                        <th scope="col">Timestamp</th>
                        <th scope="col">Current Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(MED).map(function (key) {
                        const expirationDate = formatExpirationDate(MED[key].expirationDate); // Use formatExpirationDate to display only date
                        const timestampDate = formatTimestamp(MED[key].timestamp); // Use formatTimestamp to display date and time
                        return (
                            <tr key={key}>
                                <td>{MED[key].id}</td>
                                <td>{MED[key].name}</td>
                                <td>{Web3.utils.fromWei(MED[key].price, 'ether')}</td>
                                <td>{MED[key].quantity}</td>
                                <td>{expirationDate}</td>
                                <td>{timestampDate}</td>
                                <td>{MedStage[key]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default AddMed;
