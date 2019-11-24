const expect = require("expect.js");
const forge = require("node-forge");
const { readFileSync } = require("fs");

const publicKey = readFileSync(`${__dirname}/keys/id_rsa.pub`).toString();
const privateKey = readFileSync(`${__dirname}/keys/id_rsa`).toString();

describe.only("Encryption", () => {
    it("encrypts and decrypts a simple value", async () => {
        const PKI = forge.pki;
        const rsaPublicKey = PKI.publicKeyFromPem(publicKey);
        const rsaPrivateKey = PKI.privateKeyFromPem(privateKey);
        const encryptedMessage = rsaPublicKey.encrypt("hello");
        console.log(Buffer.from(encryptedMessage, "binary").toString("hex"))
    });
});