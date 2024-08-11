This is a Pharma Supply chain built during the NEXGEN'24 hackathon.

It uses Ethereum blockchain technology realized through Truffle, the website is built using reactJs with nodejs and express js as backend.
It is connected to the local blockchain through ganache and can be deployed locally. It is then connected to metamask to perform transactions.

Idea:(Skip if you want to see only working)
The website is aimed to provide assistance to warehouses, which enlist the various entities in thier supply chain, currently we have 
1) manufacturer,2)shipment,3)distributor and 4) warehouse as the entities, each entity enrolls by providing thier public address through metamask and
 they are requested to enter details of the product like expiration date and date of release, they will be paying the entities through the website in Ethers.
Our system helps making the blockchain more TRANSPARENT and IMMUTABLE.

Commands to deploy:
1)open terminal in root:
truffle compile (explanation: helps to compile the solidity contract)
truffle migrate --reset  (explanation: connects to the ganache workspace)
2)open another terminal in client:
npm start   (starts the react app in localhost:3000)

Screenshots:
![image](https://github.com/user-attachments/assets/d71741f9-0a2a-4838-a9f8-915a7ddbe7c9)
![image](https://github.com/user-attachments/assets/099c353a-724a-4f39-9479-d830b2030d70)

note: open metamask,create a network called supplychain
rpc id: HTTP://127.0.0.1:7545 chainid:1337
and connect the 4 accounts to different accounts in ganache by importing each by copying its private keys.
ensure the first account in ganache is made the warehouse

Functionaties
1)assign roles:to map the entities to the wallet addresses
![image](https://github.com/user-attachments/assets/070ff24e-d9aa-4e28-ac2a-09a25735ceb5)
as you see to enlist you need to pay a gas fee and ensure that it is paid by the warehouse as the warehouse initiates the supply chain.
similary done for the other entities, by entering thier respective public addresses

2)order product
![image](https://github.com/user-attachments/assets/3185f9db-5a1d-43d5-a8f1-f105b20d5812)
enter the details and the warehouse pays the contract cost.

3)control supply chain( to initiate the supply chain for the given product)
![image](https://github.com/user-attachments/assets/707aaf78-eb65-44b4-9668-acc904518159)
the supply chain order has to be maintained enter the product id for the product, and ensure the manufacture pays the 
price, the next entity will pay the manufacturer

4)view transactions:
this is the log of the transactions done so far and is immutable and transparent
![image](https://github.com/user-attachments/assets/15b2e6eb-e80e-49e3-ad3e-ed2983004ad9)

5)track the product:
![image](https://github.com/user-attachments/assets/21b4ff62-6f7c-46b8-84f0-b867689b1227)
this shows at which stage the product is still in.










