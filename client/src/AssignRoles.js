import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainABI from './artifacts/SupplyChain.json';
import { useHistory } from 'react-router-dom';

function AssignRoles() {
    const history = useHistory();
    const [currentAccount, setCurrentAccount] = useState('');
    const [loader, setLoader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState(null);
    const [ManufacturerName, setManufacturerName] = useState('');
    const [ShippingName, setShippingName] = useState('');
    const [DistributorName, setDistributorName] = useState('');
    const [WarehouseName, setWarehouseName] = useState('');
    const [ManufacturerPlace, setManufacturerPlace] = useState('');
    const [ShippingPlace, setShippingPlace] = useState('');
    const [DistributorPlace, setDistributorPlace] = useState('');
    const [WarehousePlace, setWarehousePlace] = useState('');
    const [ManufacturerAddress, setManufacturerAddress] = useState('');
    const [ShippingAddress, setShippingAddress] = useState('');
    const [DistributorAddress, setDistributorAddress] = useState('');
    const [WarehouseAddress, setWarehouseAddress] = useState('');
    const [Manufacturers, setManufacturers] = useState({});
    const [Shippings, setShippings] = useState({});
    const [Distributors, setDistributors] = useState({});
    const [Warehouses, setWarehouses] = useState({});

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    };

    const loadBlockchainData = async () => {
        setLoader(true);
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setCurrentAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);

            await loadManufacturers(supplychain);
            await loadShippings(supplychain);
            await loadDistributors(supplychain);
            await loadWarehouses(supplychain);
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }
        setLoader(false);
    };

    const loadManufacturers = async (supplychain) => {
        try {
            const manufacturerCount = await supplychain.methods.manCtr().call(); // Updated
            let manufacturers = {};
            for (let i = 1; i <= manufacturerCount; i++) {
                const manufacturer = await supplychain.methods.MAN(i).call();
                manufacturers[i] = manufacturer;
            }
            setManufacturers(manufacturers);
        } catch (error) {
            console.error('Error loading manufacturers:', error);
        }
    };

    const loadShippings = async (supplychain) => {
        try {
            const shippingCount = await supplychain.methods.shipCtr().call(); // Updated
            let shippings = {};
            for (let i = 1; i <= shippingCount; i++) {
                const shipping = await supplychain.methods.SHIP(i).call();
                shippings[i] = shipping;
            }
            setShippings(shippings);
        } catch (error) {
            console.error('Error loading shippings:', error);
        }
    };

    const loadDistributors = async (supplychain) => {
        try {
            const distributorCount = await supplychain.methods.disCtr().call(); // Updated
            let distributors = {};
            for (let i = 1; i <= distributorCount; i++) {
                const distributor = await supplychain.methods.DIS(i).call();
                distributors[i] = distributor;
            }
            setDistributors(distributors);
        } catch (error) {
            console.error('Error loading distributors:', error);
        }
    };

    const loadWarehouses = async (supplychain) => {
        try {
            const warehouseCount = await supplychain.methods.warCtr().call(); // Updated
            let warehouses = {};
            for (let i = 1; i <= warehouseCount; i++) {
                const warehouse = await supplychain.methods.WAR(i).call();
                warehouses[i] = warehouse;
            }
            setWarehouses(warehouses);
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    };

    const redirectToHome = () => {
        history.push('/');
    };

    const handleChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleSubmit = (method, ...params) => async (event) => {
        event.preventDefault();
        try {
            console.log('Submitting with method:', method, 'and params:', params);
            if (SupplyChain && SupplyChain.methods[method]) {
                const receipt = await SupplyChain.methods[method](...params).send({ from: currentAccount });
                console.log('Transaction receipt:', receipt);
                if (receipt) {
                    await loadBlockchainData(); // Refresh data after registration
                }
            } else {
                console.error('Method not found in SupplyChain contract:', method);
                alert('The method does not exist in the contract.');
            }
        } catch (err) {
            console.error('Error occurred:', err);
            alert('An error occurred!!! Check the console for details.');
        }
    };

    if (loader) {
        return (
            <div>
                <h1 className="wait">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-12 text-right">
                    <span className="btn btn-outline-danger btn-sm" onClick={redirectToHome}>HOME</span>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h4>Current Account Address: {currentAccount}</h4>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-md-12">
                    <h4>Manufacturers:</h4>
                    <form onSubmit={handleSubmit('addManufacturer', ManufacturerAddress, ManufacturerName, ManufacturerPlace)}>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ManufacturerAddress} onChange={handleChange(setManufacturerAddress)} placeholder="Ethereum Address" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ManufacturerName} onChange={handleChange(setManufacturerName)} placeholder="Manufacturer Name" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ManufacturerPlace} onChange={handleChange(setManufacturerPlace)} placeholder="Based In" required />
                        </div>
                        <button className="btn btn-outline-success btn-sm" type="submit">Register</button>
                    </form>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Place</th>
                                <th scope="col">Ethereum Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(Manufacturers).map((key) => (
                                <tr key={key}>
                                    <td>{Manufacturers[key].id}</td>
                                    <td>{Manufacturers[key].name}</td>
                                    <td>{Manufacturers[key].place}</td>
                                    <td>{Manufacturers[key].addr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-md-12">
                    <h4>Shippings:</h4>
                    <form onSubmit={handleSubmit('addShippingAgent', ShippingAddress, ShippingName, ShippingPlace)}>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ShippingAddress} onChange={handleChange(setShippingAddress)} placeholder="Ethereum Address" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ShippingName} onChange={handleChange(setShippingName)} placeholder="Shipping Name" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={ShippingPlace} onChange={handleChange(setShippingPlace)} placeholder="Based In" required />
                        </div>
                        <button className="btn btn-outline-success btn-sm" type="submit">Register</button>
                    </form>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Place</th>
                                <th scope="col">Ethereum Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(Shippings).map((key) => (
                                <tr key={key}>
                                    <td>{Shippings[key].id}</td>
                                    <td>{Shippings[key].name}</td>
                                    <td>{Shippings[key].place}</td>
                                    <td>{Shippings[key].addr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-md-12">
                    <h4>Distributors:</h4>
                    <form onSubmit={handleSubmit('addDistributor', DistributorAddress, DistributorName, DistributorPlace)}>
                        <div className="form-group">
                            <input className="form-control" type="text" value={DistributorAddress} onChange={handleChange(setDistributorAddress)} placeholder="Ethereum Address" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={DistributorName} onChange={handleChange(setDistributorName)} placeholder="Distributor Name" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={DistributorPlace} onChange={handleChange(setDistributorPlace)} placeholder="Based In" required />
                        </div>
                        <button className="btn btn-outline-success btn-sm" type="submit">Register</button>
                    </form>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Place</th>
                                <th scope="col">Ethereum Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(Distributors).map((key) => (
                                <tr key={key}>
                                    <td>{Distributors[key].id}</td>
                                    <td>{Distributors[key].name}</td>
                                    <td>{Distributors[key].place}</td>
                                    <td>{Distributors[key].addr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-md-12">
                    <h4>Warehouses:</h4>
                    <form onSubmit={handleSubmit('addWarehouseAgent', WarehouseAddress, WarehouseName, WarehousePlace)}>
                        <div className="form-group">
                            <input className="form-control" type="text" value={WarehouseAddress} onChange={handleChange(setWarehouseAddress)} placeholder="Ethereum Address" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={WarehouseName} onChange={handleChange(setWarehouseName)} placeholder="Warehouse Name" required />
                        </div>
                        <div className="form-group">
                            <input className="form-control" type="text" value={WarehousePlace} onChange={handleChange(setWarehousePlace)} placeholder="Based In" required />
                        </div>
                        <button className="btn btn-outline-success btn-sm" type="submit">Register</button>
                    </form>
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Place</th>
                                <th scope="col">Ethereum Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(Warehouses).map((key) => (
                                <tr key={key}>
                                    <td>{Warehouses[key].id}</td>
                                    <td>{Warehouses[key].name}</td>
                                    <td>{Warehouses[key].place}</td>
                                    <td>{Warehouses[key].addr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AssignRoles;
