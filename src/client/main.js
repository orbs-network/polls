import App from "./App.svelte";
import { Client } from "orbs-client-sdk";
import { Wallet } from "orbs-wallet/src/wallet/wallet";
import { Polls } from "../polls";
import { pki } from "node-forge";
import { Identity } from "../../identity/src/identity";

const POLLS_PUBLIC_KEY = "polls_public_key";
const POLLS_PRIVATE_KEY = "polls_private_key";

if (!localStorage.getItem(POLLS_PUBLIC_KEY)) {
    const keys = pki.rsa.generateKeyPair(2048);
    localStorage.setItem(POLLS_PUBLIC_KEY, pki.publicKeyToPem(keys.publicKey));
    localStorage.setItem(POLLS_PRIVATE_KEY, pki.privateKeyToPem(keys.privateKey));
}

const publicKey = localStorage.getItem(POLLS_PUBLIC_KEY);
const privateKey = localStorage.getItem(POLLS_PRIVATE_KEY);

export default (async () => {
    const wallet = new Wallet(window);
    let accounts;
    try {
        accounts = await wallet.enable(); // should open a separate extension window that asks for the password
    } catch (e) {
        console.log("Could not initialize wallet: " + e.toString());
        throw e;
    }

    const account = accounts[0];
    const client = new Client(
        process.env.ORBS_NODE_ADDRESS,
        process.env.ORBS_VCHAIN,
        "TEST_NET",
        account,
    );

    const polls = new Polls(client, process.env.ORBS_POLLS);
    const identity = new Identity(client, process.env.ORBS_IDENTITY);
    const app = new App({
        target: document.getElementById("content"),
        props: {
            account,
            polls,
            identity,
            config: {
                prismURL: process.env.ORBS_PRISM_URL,
                vchain: process.env.ORBS_VCHAIN,
                signInUrl: process.env.ORBS_IDENTITY_SIGN_IN_URL,
                publicKey,
                privateKey,
            }
        }
    });
    return app;
})();
