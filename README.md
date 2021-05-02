# Ethereum-Ranked-Choice-Voting-DApp
Ranked Choice Voting DApp Implemented in Solidity

Ranked Choice Voting Algorithm DApp Instructions:
The following versions of the following packages are required to run this program
-	NPM 6.14.11
-	Node v14.16.0
-	Truffle v5.3.2 (core: 5.3.2) 
-	Solidity >=0.4.22 
-	Liteserver 2.6.1
-	Web3 1.3.1
-	Ganache 2.5.4

Steps:
1.	Open and run Ganache
2.	Open cmd and navigate to the file directory “election”
a.	If the directory is placed in C:\Users\ this is simplify done using “cd election”
3.	Migrate the contract to the blockchain and reset it using “truffle migrate --reset”
4.	Open a second cmd window and open lite-server to launch the client interface for the DApp.  This is done by navigating to the same file directory “cd election” and running “npm run dev”
5.	The default browser (Chrome / Firefox) will open to localhost:3000
6.	Login to MetaMask using the browser extension
7.	Import accounts into MetaMask from Ganache using the private keys
8.	Connect to the local network running the blockchain using a Custom RPC and the server URL from Ganache (likely HTTP://127.0.0.1:7545)
a.	Note you may be required to manually connect the accounts under the ‘Account Options’ 
9.	Refresh the localhost:3000 page if required
10.	Using MetaMask send ETH to the contract address
a.	The contract address can be obtained from the localhost:3000 page or from the first cmd window truffle output
11.	Refresh the page and check to see the contract has received the ETH (the balance is reported at the bottom of the page)
12.	You may now select the candidates to vote on and interact with the DApp
13.	You may also interact with the DApp from the POV of other Ganache accounts to observe the Ranked Choice Algorithm behaviour

Screenshot of DApp Operation:

![image](https://user-images.githubusercontent.com/71515789/116817004-6f5ccf80-ab32-11eb-9cb4-11cfbe13a7fc.png)
