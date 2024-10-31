import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { keyring as uiKeyring } from "@polkadot/ui-keyring";
import { waitReady } from "@polkadot/wasm-crypto";

export const App = () => {
	const [count, setCount] = useState(0);
	let counter = 0;
	let counterErrors = 0;
	const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
	const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

	const connectOnchain = async () => {

		console.log("connectOnchain");
		setCount(count + 1);
		try {
			await waitReady();
			uiKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
		} catch (error) {
			console.log(error);
		} finally {
			const wsProvider = new WsProvider(
				"wss://...........",
			);
			const api = await ApiPromise.create({ provider: wsProvider });
			const holderPair = uiKeyring.getPair(BOB);
			const genesisHash = api.genesisHash;
			const runtimeVersion = api.runtimeVersion;
			let limit = 0;
			let blockhash = "";
			const nonce = await api.rpc.system.accountNextIndex(holderPair.address);
			// Get a random number between 1 and 20
			const randomAmount = Math.floor(Math.random() * 20 + 1);
			// Create a extrinsic, transferring randomAmount units to Bob.
			const transfer = api.tx.balances
				.transferAllowDeath(ALICE, randomAmount)
				.sign(holderPair, {
					genesisHash,
					blockHash: genesisHash,
					nonce,
					runtimeVersion,
				});
			const sub = await api.rpc.author.submitAndWatchExtrinsic(
				transfer.toJSON(),
				async (result) => {
					if (result.isInBlock || result.isFinalized) {
						console.log(`Block Created`);
						counter += 1;
						blockhash = result.inner.toString();
						sub()
					} else {
						console.log(`====================`);
						console.log(`Block Status: ${result.type}`);
						console.log(`====================`);
						if (result.isInvalid) {
							console.log(`*********************************************************************************`);
							console.log(`Invalid Transaction`);
							console.log(result);
							console.log(`*********************************************************************************`);
							counterErrors += 1;
						}
					}
				},
			);
			do {
				limit += 1;
				await new Promise((resolve) => {
					setTimeout(() => {
						resolve("response");
					}, 1000);
				}); // aguardar 3 segundos
				console.log("Waiting... ", limit);
			} while (!blockhash && limit < 100);
			if (blockhash) {
				console.log("Found ", blockhash);
				console.log("Total: ", counter);
			}
			api.disconnect();
		}
		console.log('End')
		console.log('Erros: ', counterErrors)
	};
	// useEffect(() => {
	//   connectOnchain()
	// }, [])

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button type="button" onClick={connectOnchain}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
};

export default App;
