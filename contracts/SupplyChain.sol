// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SupplyChain {
    address public Owner;

    constructor() {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only the owner can perform this action.");
        _;
    }

    enum STAGE {
        Init,
        Manufacture,
        Shipping,
        Distribution,
        Warehouse,
        Sold
    }

    uint256 public medicineCtr = 0;
    uint256 public manCtr = 0;
    uint256 public shipCtr = 0;
    uint256 public disCtr = 0;
    uint256 public warCtr = 0;

    struct Medicine {
        uint256 id;
        string name;
        uint256 price;
        uint256 quantity;
        uint256 expirationDate;
        uint256 timestamp;
        uint256 MANid;
        uint256 SHIPid;
        uint256 DISid;
        uint256 WARid;
        STAGE stage;
    }

    mapping(uint256 => Medicine) public MedicineStock;

    struct Manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => Manufacturer) public MAN;

    struct ShippingAgent {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => ShippingAgent) public SHIP;

    struct Distributor {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => Distributor) public DIS;

    struct WarehouseAgent {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => WarehouseAgent) public WAR;

    event StageUpdated(uint256 indexed productId, STAGE stage);
    event PaymentMade(address indexed from, address indexed to, uint256 amount, uint256 productId, STAGE stage);

    function findManufacturer(address _address) internal view returns (uint256) {
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        revert("Manufacturer not found.");
    }

    function findShippingAgent(address _address) internal view returns (uint256) {
        for (uint256 i = 1; i <= shipCtr; i++) {
            if (SHIP[i].addr == _address) return SHIP[i].id;
        }
        revert("Shipping agent not found.");
    }

    function findDistributor(address _address) internal view returns (uint256) {
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        revert("Distributor not found.");
    }

    function findWarehouseAgent(address _address) internal view returns (uint256) {
        for (uint256 i = 1; i <= warCtr; i++) {
            if (WAR[i].addr == _address) return WAR[i].id;
        }
        revert("Warehouse agent not found.");
    }

    function showStage(uint256 _medicineID) public view returns (string memory) {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");

        if (MedicineStock[_medicineID].stage == STAGE.Init)
            return "Product Ordered";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture)
            return "Manufacturing Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Shipping)
            return "Shipping Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution)
            return "Distribution Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Warehouse)
            return "Warehouse Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Sold)
            return "Product Sold";

        revert("Stage not found.");
    }

    function startManufacturing(uint256 _productId) public payable {
        Medicine storage med = MedicineStock[_productId];
        uint256 paymentAmount = med.price * med.quantity;
        require(msg.value == paymentAmount, "Incorrect payment amount.");

        med.MANid = findManufacturer(msg.sender);
        med.stage = STAGE.Manufacture;
        emit StageUpdated(_productId, STAGE.Manufacture);
        emit PaymentMade(msg.sender, address(this), msg.value, _productId, STAGE.Manufacture);
    }

    function startShipping(uint256 _productId) public payable {
        Medicine storage med = MedicineStock[_productId];
        uint256 paymentAmount = (med.price * med.quantity) * 125 / 100;
        address manufacturer = MAN[med.MANid].addr;

        require(msg.value == paymentAmount, "Incorrect payment amount.");
        payable(manufacturer).transfer(paymentAmount);

        med.SHIPid = findShippingAgent(msg.sender);
        med.stage = STAGE.Shipping;
        emit StageUpdated(_productId, STAGE.Shipping);
        emit PaymentMade(msg.sender, manufacturer, msg.value, _productId, STAGE.Shipping);
    }

    function startDistribution(uint256 _productId) public payable {
        Medicine storage med = MedicineStock[_productId];
        uint256 paymentAmount = (med.price * med.quantity) * 135 / 100;
        address shipping = SHIP[med.SHIPid].addr;

        require(msg.value == paymentAmount, "Incorrect payment amount.");
        payable(shipping).transfer(paymentAmount);

        med.DISid = findDistributor(msg.sender);
        med.stage = STAGE.Distribution;
        emit StageUpdated(_productId, STAGE.Distribution);
        emit PaymentMade(msg.sender, shipping, msg.value, _productId, STAGE.Distribution);
    }

    function storeInWarehouse(uint256 _productId) public payable {
        Medicine storage med = MedicineStock[_productId];
        uint256 paymentAmount = (med.price * med.quantity) * 145 / 100;
        address distributor = DIS[med.DISid].addr;

        require(msg.value == paymentAmount, "Incorrect payment amount.");
        payable(distributor).transfer(paymentAmount);

        med.WARid = findWarehouseAgent(msg.sender);
        med.stage = STAGE.Warehouse;
        emit StageUpdated(_productId, STAGE.Warehouse);
        emit PaymentMade(msg.sender, distributor, msg.value, _productId, STAGE.Warehouse);
    }

    function sell(uint256 _medicineID) public payable {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid medicine ID.");
        uint256 _id = findWarehouseAgent(msg.sender);
        require(_id > 0, "Warehouse agent not found.");
        require(_id == MedicineStock[_medicineID].WARid, "Unauthorized warehouse.");
        require(MedicineStock[_medicineID].stage == STAGE.Warehouse, "Incorrect stage.");

        Medicine storage med = MedicineStock[_medicineID];
        uint256 totalPrice = med.price * med.quantity;
        uint256 amountWarehouse = totalPrice * 145 / 100;

        require(msg.value == amountWarehouse, "Incorrect payment amount.");

        // Pay the previous entities
        address manufacturer = MAN[med.MANid].addr;
        address shipping = SHIP[med.SHIPid].addr;
        address distributor = DIS[med.DISid].addr;

        // Payment from Warehouse to Distributor
        payable(distributor).transfer(amountWarehouse);
        // Payment from Distributor to Shipping
        payable(shipping).transfer(amountWarehouse * 135 / 145);
        // Payment from Shipping to Manufacturer
        payable(manufacturer).transfer(amountWarehouse * 125 / 145);

        // Mark the medicine as sold
        med.stage = STAGE.Sold;
        emit StageUpdated(_medicineID, STAGE.Sold);
    }

    function addMedicine(
        string memory _name,
        uint256 _price,
        uint256 _quantity,
        uint256 _expirationDate
    ) public onlyByOwner {
        medicineCtr++;
        MedicineStock[medicineCtr] = Medicine(
            medicineCtr,
            _name,
            _price,
            _quantity,
            _expirationDate,
            block.timestamp,
            0, // Initialize manufacturer ID
            0, // Initialize shipping ID
            0, // Initialize distributor ID
            0, // Initialize warehouse ID
            STAGE.Init
        );
    }

    function addManufacturer(
        address _addr,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        manCtr++;
        MAN[manCtr] = Manufacturer(_addr, manCtr, _name, _place);
    }

    function addShippingAgent(
        address _addr,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        shipCtr++;
        SHIP[shipCtr] = ShippingAgent(_addr, shipCtr, _name, _place);
    }

    function addDistributor(
        address _addr,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        disCtr++;
        DIS[disCtr] = Distributor(_addr, disCtr, _name, _place);
    }

    function addWarehouseAgent(
        address _addr,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        warCtr++;
        WAR[warCtr] = WarehouseAgent(_addr, warCtr, _name, _place);
    }

    receive() external payable {}
}
