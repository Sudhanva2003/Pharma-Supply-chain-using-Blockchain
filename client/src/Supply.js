import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import "./supply.css";

function Supply() {
    const history = useHistory();

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    const [currentAccount, setCurrentAccount] = useState("");
    const [loader, setLoader] = useState(true);
    const [supplyChain, setSupplyChain] = useState();
    const [medData, setMedData] = useState({});
    const [medStage, setMedStage] = useState({});
    const [id, setId] = useState("");
    const [error, setError] = useState("");

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    };

    const loadBlockchainData = async () => {
        setLoader(true);
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentAccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            const medCtr = await supplychain.methods.medicineCtr().call();
            const med = {};
            const medStage = {};
            for (let i = 0; i < medCtr; i++) {
                const medId = i + 1;
                med[medId] = await supplychain.methods.MedicineStock(medId).call();
                medStage[medId] = await supplychain.methods.showStage(medId).call();
            }
            setMedData(med);
            setMedStage(medStage);
            setLoader(false);
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }
    };

    if (loader) {
        return (
            <div className="container">
                <h1 className="wait">Loading...</h1>
            </div>
        );
    }

    const redirectToHome = () => {
        history.push('/');
    };

    const handleIdChange = (event) => {
        setId(event.target.value);
    };

    const calculatePayment = (priceInEther, quantity) => {
        const priceInWei = Web3.utils.toWei(priceInEther.toString(), 'ether');
        const totalPriceInWei = Web3.utils.toBN(priceInWei).mul(Web3.utils.toBN(quantity));
    
        const amountManufacturerInWei = totalPriceInWei;
        const amountShippingInWei = totalPriceInWei.mul(Web3.utils.toBN(125)).div(Web3.utils.toBN(100));
        const amountDistributorInWei = totalPriceInWei.mul(Web3.utils.toBN(135)).div(Web3.utils.toBN(100));
        const amountWarehouseInWei = totalPriceInWei.mul(Web3.utils.toBN(145)).div(Web3.utils.toBN(100));
    
        return {
            totalPriceInWei: totalPriceInWei.toString(),
            amountManufacturerInWei: amountManufacturerInWei.toString(),
            amountShippingInWei: amountShippingInWei.toString(),
            amountDistributorInWei: amountDistributorInWei.toString(),
            amountWarehouseInWei: amountWarehouseInWei.toString(),
        };
    };
    
    const handleSubmit = async (event, methodName) => {
        event.preventDefault();
        setError("");
    
        try {
            const productId = parseInt(id, 10);
            if (isNaN(productId)) {
                throw new Error("Invalid Product ID");
            }
    
            // Fetch the product details and current stage
            const product = await supplyChain.methods.MedicineStock(productId).call();
            const priceInEther = Web3.utils.fromWei(product.price, 'ether');
            const quantity = product.quantity;
            const currentStage = await supplyChain.methods.showStage(productId).call();
    
            console.log(`Product ID: ${productId}, Current Stage: ${currentStage}, Method: ${methodName}`);
    
            const { amountManufacturerInWei, amountShippingInWei, amountDistributorInWei, amountWarehouseInWei } = calculatePayment(priceInEther, quantity);
    
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
    
            // Check if the method is valid
            const method = supplyChain.methods[methodName];
            if (!method) {
                throw new Error(`Method ${methodName} does not exist on the smart contract.`);
            }
    
            // Validate stage transitions for the specific product
            switch (methodName) {
                case 'startManufacturing':
                    if (currentStage !== 'Product Ordered') {
                        throw new Error(`Product cannot be manufactured at this stage. Current stage is ${currentStage}.`);
                    }
                    break;
                case 'startShipping':
                    if (currentStage !== 'Manufacturing Stage') {
                        throw new Error(`Shipping can only occur after manufacturing. Current stage is ${currentStage}.`);
                    }
                    break;
                case 'startDistribution':
                    if (currentStage !== 'Shipping Stage') {
                        throw new Error(`Distribution can only occur after shipping. Current stage is ${currentStage}.`);
                    }
                    break;
                case 'storeInWarehouse':
                    if (currentStage !== 'Distribution Stage') {
                        throw new Error(`Storing in warehouse can only occur after distribution. Current stage is ${currentStage}.`);
                    }
                    break;
                case 'sell':
                    if (currentStage !== 'Warehouse Stage') {
                        throw new Error(`Selling can only occur after storing in warehouse. Current stage is ${currentStage}.`);
                    }
                    break;
                default:
                    throw new Error(`Unknown method ${methodName}`);
            }
    
            // Determine the value to send based on the method
            let valueToSend;
            switch (methodName) {
                case 'startManufacturing':
                    valueToSend = amountManufacturerInWei;
                    break;
                case 'startShipping':
                    valueToSend = amountShippingInWei;
                    break;
                case 'startDistribution':
                    valueToSend = amountDistributorInWei;
                    break;
                case 'storeInWarehouse':
                    valueToSend = amountWarehouseInWei;
                    break;
                case 'sell':
                    valueToSend = amountWarehouseInWei; // Assuming sell method uses warehouse amount
                    break;
                default:
                    throw new Error(`Unknown method ${methodName}`);
            }
    
            // Estimate gas
            let gasEstimate;
            try {
                gasEstimate = await method(productId).estimateGas({ from: account, value: valueToSend });
            } catch (error) {
                console.error("Gas estimation failed:", error);
                gasEstimate = 3000000; // Fallback gas limit
            }
    
            // Send transaction
            const result = await method(productId).send({
                from: account,
                gas: gasEstimate,
                value: valueToSend
            });
    
            alert(`Successfully called ${methodName} with transaction hash: ${result.transactionHash}`);
            setId("");
        } catch (error) {
            console.error(`Error in ${methodName}:`, error);
            setError(`Error in ${methodName}: ${error.message}`);
        }
    };
    
    
    
    
    
    
    
    

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return {
            date: date.toLocaleDateString(),
            dateTime: date.toLocaleString()
        };
    };

    return (
        <div className='container'>
            <span><b>Current Account Address:</b> {currentAccount}</span>
            <span onClick={redirectToHome} className="btn btn-outline-danger btn-sm btn-home"> HOME</span>
            
            <table className="table table-sm table-dark">
                <thead>
                    <tr>
                        <th scope="col">Product ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Expiration Date</th>
                        <th scope="col">Timestamp</th>
                        <th scope="col">Current Processing Stage</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(medData).map((key) => {
                        const { date, dateTime } = formatDate(medData[key].timestamp);
                        return (
                            <tr key={key}>
                                <td>{medData[key].id}</td>
                                <td>{medData[key].name}</td>
                                <td>{Web3.utils.fromWei(medData[key].price, 'ether')}</td>
                                <td>{medData[key].quantity}</td>
                                <td>{new Date(medData[key].expirationDate * 1000).toLocaleDateString()}</td>
                                <td>{dateTime}</td>
                                <td>{medStage[key]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="step">
                <h5><b>Step 1: Manufacturing</b></h5>
                <form onSubmit={(event) => handleSubmit(event, 'startManufacturing')}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="ID"
                            value={id}
                            onChange={handleIdChange}
                            className="form-control-sm"
                            placeholder="Enter Product ID"
                        />
                        <button type="submit" className="btn btn-primary btn-submit">Manufacture Product</button>
                    </div>
                </form>
            </div>

            <div className="step">
                <h5><b>Step 2: Shipping</b></h5>
                <form onSubmit={(event) => handleSubmit(event, 'startShipping')}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="ID"
                            value={id}
                            onChange={handleIdChange}
                            className="form-control-sm"
                            placeholder="Enter Product ID"
                        />
                        <button type="submit" className="btn btn-primary btn-submit">Ship Product</button>
                    </div>
                </form>
            </div>

            <div className="step">
                <h5><b>Step 3: Distribution</b></h5>
                <form onSubmit={(event) => handleSubmit(event, 'startDistribution')}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="ID"
                            value={id}
                            onChange={handleIdChange}
                            className="form-control-sm"
                            placeholder="Enter Product ID"
                        />
                        <button type="submit" className="btn btn-primary btn-submit">Distribute Product</button>
                    </div>
                </form>
            </div>

            <div className="step">
                <h5><b>Step 4: Warehouse</b></h5>
                <form onSubmit={(event) => handleSubmit(event, 'storeInWarehouse')}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="ID"
                            value={id}
                            onChange={handleIdChange}
                            className="form-control-sm"
                            placeholder="Enter Product ID"
                        />
                        <button type="submit" className="btn btn-primary btn-submit">Store in Warehouse</button>
                    </div>
                </form>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
}

export default Supply;
