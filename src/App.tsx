import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { keyring as uiKeyring } from "@polkadot/ui-keyring";
import { waitReady } from "@polkadot/wasm-crypto";

export const App = () => {
	const [count, setCount] = useState(0);
	const [count2, setCount2] = useState(0);
	const [api, setOnchainAPi] = useState<ApiPromise | undefined>(undefined);
	let counter = 0;
	let counterErrors = 0;
	let reSends = 0;
	const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
	const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";


	const connectOnchain0 = async () => {
		if (!api) {
			console.log("API not connected");
			return;
		}
		console.log("Desconectando na chain");

		await api.disconnect();

	}

	const connectOnchain1 = async () => {

		console.log("Connectando na chain");
		try {
			await waitReady();
			uiKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
		} catch (error) {
			console.log(error);
		} finally {
			const wsProvider = new WsProvider(
				// "wss://dev-origin-parachain-client-rpc-01.multiledgers.com?token=multi12345"
				"ws://127.0.0.1:5044" // LOCAL
			);
			const api = await ApiPromise.create({ provider: wsProvider });
			setOnchainAPi(api);
		};
	}

	const connectOnchain = async () => {
		if (!api) {
			console.log("API not connected");
			return;
		}
		console.log("connectOnchain");
		setCount(count + 1);

		const holderPair = uiKeyring.getPair(ALICE);
		const genesisHash = api.genesisHash;
		const runtimeVersion = api.runtimeVersion;
		let limit = 0;
		const list = Array.from({ length: 1000 }, (_, i) => i);
		for (const item of list) {

			let blockhash = "";
			const nonce = await api.rpc.system.accountNextIndex(holderPair.address);
			// Get a random number between 1 and 20
			const randomAmount = Math.floor(counter + 1);
			// Create a extrinsic, transferring randomAmount units to Bob.
			const transfer = api.tx.balances
				.transferAllowDeath(BOB, randomAmount)
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
							counter += 1;
							const retrySigned = transfer.toJSON()
							console.log(transfer.toJSON());
							console.log(`BlockNumber: ${(await api.rpc.chain.getHeader()).number}`);
							console.log(`*********************************************************************************`);
							counterErrors += 1;
							// sub();
							console.log(`Waiting for Next Block ....`);
							await new Promise((resolve) => {
								setTimeout(() => {
									resolve("response");
								}, 13000);
							});
							console.log(`Retry sending transaction`);
							// const NEW_TRY = await api.rpc.author.submitExtrinsic(transfer.toJSON());
							const sub2 = await api.rpc.author.submitExtrinsic(
								retrySigned,
							);
							console.log('Sub2')
							console.log(sub2.toString())
							console.log(sub2.toHex())
							console.log(sub2.hash.toString())
							console.log(sub2.hash.toHex())
							console.log('Enviou?????')
							console.log('Transaction é a de:', counter)
							console.log(`BlockNumber: ${(await api.rpc.chain.getHeader()).number}`);
							console.log(`BlockNumber HASH: ${(await api.rpc.chain.getHeader()).hash}`);
							console.log('Waiting for next blockhash...')
							await new Promise((resolve) => {
								setTimeout(() => {
									resolve("response");
								}, 13000);
							});
							blockhash = (await api.rpc.chain.getHeader()).hash.toString();
							console.log('Blockhash: ', blockhash)
							await new Promise((resolve) => {
								setTimeout(() => {
									resolve("response");
								}, 12000);
							});
							// if (blockhash) {
							// 	reSends += 1;
							// }
							reSends += 1;
							console.log(`========= END ===========`);
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
			} while (!blockhash && limit < 80);
			if (blockhash) {
				console.log("erros ", counterErrors);
				console.log("Total: ", counter);
				console.log("resends: ", reSends);
				limit = 0;

			}
		};
		console.log("FINAL Total: ", counter);
		console.log("FINAL Total errors: ", counterErrors);
		console.log("FINAL RESEND: ", reSends);
	};

	const connectOnchain2 = async () => {
		if (!api) {
			console.log("API not connected");
			return;
		}
		console.log("connectOnchain 2");
		setCount2(count2 + 1);

		const holderPair2 = uiKeyring.getPair(BOB);
		const genesisHash = api.genesisHash;
		const runtimeVersion = api.runtimeVersion;
		let limit = 0;
		let blockhash = "";
		const list = Array.from({ length: 500 }, (_, i) => i);
		for (const item of list) {
			const nonce = await api.rpc.system.accountNextIndex(holderPair2.address);
			// Get a random number between 1 and 20
			const randomAmount = Math.floor(Math.random() * 20 + 1);
			// Create a extrinsic, transferring randomAmount units to Bob.
			const transfer = api.tx.balances
				.transferAllowDeath(ALICE, randomAmount)
				.sign(holderPair2, {
					genesisHash,
					blockHash: genesisHash,
					nonce,
					runtimeVersion,
				});
			const sub = await api.rpc.author.submitAndWatchExtrinsic(
				transfer.toJSON(),
				async (result) => {
					if (result.isInBlock || result.isFinalized) {
						console.log(`Block Created 2`);
						counter += 1;
						blockhash = result.inner.toString();
						sub()
					} else {
						console.log(`====================`);
						console.log(`Block Status 2: ${result.type}`);
						console.log(`====================`);
						if (result.isInvalid) {
							console.log(`*********************************************************************************`);
							console.log(`Invalid Transaction 2`);
							console.log(result);
							console.log(`BlockNumber: ${(await api.rpc.chain.getHeader()).number}`);
							const index = list.indexOf(item);
							console.log(`Index: ${index}`);
							console.log(`*********************************************************************************`);
							counterErrors += 1;
						}
					}
				},
			);
			// do {
			// 	limit += 1;
			// 	await new Promise((resolve) => {
			// 		setTimeout(() => {
			// 			resolve("response");
			// 		}, 300);
			// 	}); // aguardar 3 segundos
			// 	console.log("Waiting... ", limit);
			// } while (!blockhash && limit < 300);
			if (blockhash) {
				console.log("Found ", blockhash);
				console.log("Total: ", counter);
			}
		};
	};


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
				<button type="button" onClick={connectOnchain1}>
					Connect
				</button>
				<button type="button" onClick={connectOnchain}>
					ALICE count is {count}
				</button>
				<button type="button" onClick={connectOnchain2}>
					BOB count is {count2}
				</button>
				<button type="button" onClick={connectOnchain0}>
					Disconnect
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
