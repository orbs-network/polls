import App from "./App.svelte";
import {
    Client,
    encodeHex,
    decodeHex,
    LocalSigner,
    addressToBytes,
} from "orbs-client-sdk";
import { Wallet } from "orbs-wallet/src/wallet/wallet";
import { Polls } from "../polls";

export default (async () => {
    const wallet = new Wallet(window);
    let accounts;
    try {
        accounts = await wallet.enable(); // should open a separate extension window that asks for the password
    } catch (e) {
        console.log("Could not initialize wallet: " + e.toString());
        throw e;
    }

    const signer = accounts[0];
    const client = new Client(
        process.env.ORBS_NODE_ADDRESS,
        process.env.ORBS_VCHAIN,
        "TEST_NET",
        signer,
    );

    const polls = new Polls(client, process.env.ORBS_POLLS);
    const app = new App({
        target: document.body,
        props: {
            client,
            polls,
            config: {
                prismURL: process.env.ORBS_PRISM_URL,
                vchain: process.env.ORBS_VCHAIN,
            }
        }
    });
    return app;
})();
