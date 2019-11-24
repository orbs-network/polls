const { argString, argBytes, argUint64, argUint32 } = require("orbs-client-sdk");

function getErrorFromReceipt(receipt) {
    const value = receipt.outputArguments.length == 0 ? receipt.executionResult : receipt.outputArguments[0].value;
    return new Error(value);
}

class Polls {
	constructor(orbsClient, contractName) {
		this.client = orbsClient;
		this.contractName = contractName;
	}

	async create(id, name, publicKeyHex, options) {
		const args = [
            argString(id),
			argString(name),
			argString(publicKeyHex)
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

    async vote(id, singleVote) {
        const [ tx, txId ] = await this.client.createTransaction(
            this.contractName,
            "vote",
            [
                argString(id),
                argUint32(singleVote),
            ],
        );

        const receipt = await this.client.sendTransaction(tx);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }
    }
}

module.exports = {
	Polls
};
