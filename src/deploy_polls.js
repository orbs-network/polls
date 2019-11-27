const { readFileSync, readdirSync } = require("fs");
const { join } = require("path");
const identity = require("../identity/src/deploy_identity");
const {
	Client, LocalSigner, createAccount,
	PROCESSOR_TYPE_NATIVE, NetworkType,
	decodeHex,
} = require("orbs-client-sdk");
const { Polls } = require("./polls");

function getClient(signer) {
    const endpoint = process.env.ORBS_NODE_ADDRESS || "http://localhost:8080";
    const chain = Number(process.env.ORBS_VCHAIN) || 42;
    return new Client(endpoint, chain, NetworkType.NETWORK_TYPE_TEST_NET, signer);
}

// Read all go files except tests
function getPollsContractCode() {
	const dir = join(__dirname, "contract", "polls");
	return readdirSync(dir).filter(f => f.match(/\.go$/) && !f.match(/\_test.go$/)).map(f => {
		return readFileSync(join(dir, f));
	});
}

async function deployPolls(client, contractName) {
    const [tx, txid] = await client.createDeployTransaction(contractName, PROCESSOR_TYPE_NATIVE, ...getPollsContractCode());
    const receipt = await client.sendTransaction(tx);
	if (receipt.executionResult !== 'SUCCESS') {
		throw new Error(receipt.outputArguments[0].value);
	}
}

function getContractName() {
	return process.env.ORBS_POLLS || "Polls";
}

function getLocalSigner() {
	const { ORBS_PUBLIC_KEY, ORBS_PRIVATE_KEY } = process.env;

	if (!(ORBS_PUBLIC_KEY && ORBS_PRIVATE_KEY)) {
		return new LocalSigner(createAccount());
	}

	return new LocalSigner({
        publicKey: decodeHex(ORBS_PUBLIC_KEY),
        privateKey: decodeHex(ORBS_PRIVATE_KEY),
    });
}

module.exports = {
	getClient,
	getPollsContractCode,
	deployPolls
}

if (!module.parent) {
	(async () => {
		try {
			const client = getClient(getLocalSigner());
			const identityContractName = identity.getContractName();
			const contractName = getContractName();

			console.log("deploying", identityContractName);
			await identity.deployIdentity(client, identityContractName)
			console.log("deploying", contractName);
			await deployPolls(client, contractName);

			console.log("linking", contractName, "to", identityContractName);
			const polls = new Polls(client, contractName);
			await polls.setIdentityContractAddress(identityContractName);

			console.log("Deployed Polls smart contract successfully");
		} catch (e) {
			console.error(e);
		}
	})();
}
