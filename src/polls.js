const { argString, argBytes, argUint64, argUint32, decodeHex, encodeHex } = require("orbs-client-sdk");
const forge = require("node-forge");

function getErrorFromReceipt(receipt) {
    const value = receipt.outputArguments.length == 0 ? receipt.executionResult : receipt.outputArguments[0].value;
    return new Error(value);
}

class Polls {
	constructor(orbsClient, contractName) {
		this.client = orbsClient;
		this.contractName = contractName;
	}

	async create(id, name, publicKey, options) {
		const args = [
            argString(id),
			argString(name),
			argString(publicKey)
        ];

		options.forEach((option) => {
			args.push(argString(option));
		});

		const [ tx, txId ] = await this.client.createTransaction(
			this.contractName,
			"create",
			args
		);

		const receipt = await this.client.sendTransaction(tx);
		if (receipt.executionResult !== 'SUCCESS') {
			throw getErrorFromReceipt(receipt);
		}
	}

	async get(id) {
		const query = await this.client.createQuery(
			this.contractName,
			"get",
			[
				argString(id),
			]
		);

		const receipt = await this.client.sendQuery(query);
		if (receipt.executionResult !== 'SUCCESS') {
			throw getErrorFromReceipt(receipt);
		}

		return JSON.parse(receipt.outputArguments[0].value);
	}

    async countVotes(id) {
        const query = await this.client.createQuery(
            this.contractName,
            "countVotes",
            [
                argString(id),
            ]
        );

        const receipt = await this.client.sendQuery(query);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }

        return receipt.outputArguments[0].value;
    }

    async results(id) {
        const query = await this.client.createQuery(
            this.contractName,
            "results",
            [
                argString(id),
            ]
        );

        const receipt = await this.client.sendQuery(query);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }

        return JSON.parse(receipt.outputArguments[0].value);
    }

    async getPublicKey(id) {
        const query = await this.client.createQuery(
            this.contractName,
            "getPublicKey",
            [
                argString(id),
            ]
        );

        const receipt = await this.client.sendQuery(query);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }

        return receipt.outputArguments[0].value;
    }

    async finish(id, privateKey) {
        const [ tx, txId ] = await this.client.createTransaction(
            this.contractName,
            "finish",
            [
                argString(id),
                argString(privateKey),
            ],
        );

        const receipt = await this.client.sendTransaction(tx);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }
    }

    async vote(id, singleVote) {
        const PKI = forge.pki;
        const rsaPublicKey = PKI.publicKeyFromPem(await this.getPublicKey(id));
        const encryptedVote = rsaPublicKey.encrypt(singleVote.toString());
        const [ tx, txId ] = await this.client.createTransaction(
            this.contractName,
            "vote",
            [
                argString(id),
                argBytes(Buffer.from(encryptedVote, "binary")),
            ],
        );

        const receipt = await this.client.sendTransaction(tx);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }
    }
}

module.exports = {
	Polls,
};
