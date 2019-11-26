const { argString, argBytes, argUint64, argUint32, decodeHex, encodeHex } = require("orbs-client-sdk");
const forge = require("node-forge");

function getErrorFromReceipt(receipt) {
    const value = receipt.outputArguments.length == 0 ? receipt.executionResult : receipt.outputArguments[0].value;
    return new Error(value);
}

// same as Buffer.from(encryptedVote, "binary")
function toUint8Array(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(buf);
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

        const [tx, txId] = await this.client.createTransaction(
            this.contractName,
            "create",
            args
        );

        const receipt = await this.client.sendTransaction(tx);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }
    }

    async setIdentityContractAddress(identityContractName) {
        const [tx, txId] = await this.client.createTransaction(
            this.contractName,
            "setIdentityContractAddress",
            [
                argString(identityContractName)
            ]
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

    async hasVoted(id) {
        const query = await this.client.createQuery(
            this.contractName,
            "hasVoted",
            [
                argString(id),
            ]
        );

        const receipt = await this.client.sendQuery(query);
        if (receipt.executionResult !== 'SUCCESS') {
            throw getErrorFromReceipt(receipt);
        }

        return receipt.outputArguments[0].value > 0;
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
        const [tx, txId] = await this.client.createTransaction(
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
        const [tx, txId] = await this.client.createTransaction(
            this.contractName,
            "vote",
            [
                argString(id),
                argBytes(toUint8Array(encryptedVote)),
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
