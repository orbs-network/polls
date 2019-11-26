const expect = require("expect.js");
const { createAccount, LocalSigner, encodeHex } = require("orbs-client-sdk");
const { Polls } = require("../src/polls");
const { readFileSync } = require("fs");
const { deployPolls, getClient } = require("../src/deploy_polls");

function sleep(timeout) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, timeout);
	})
}

const publicKey = readFileSync(`${__dirname}/keys/id_rsa.pub`).toString();
const privateKey = readFileSync(`${__dirname}/keys/id_rsa`).toString();

describe("Polls", () => {
    it("updates contract state", async () => {
		const contractOwner = createAccount();
		const contractName = "Polls" + new Date().getTime();

		const signer = new LocalSigner(contractOwner);
		await deployPolls(getClient(signer), contractName);
		const polls = new Polls(getClient(signer), contractName);

        let id = "best-nicolas-cage-movie";
        const emptyPoll = await polls.get(id);
		expect(emptyPoll.Name).to.be.eql("");

        await polls.create(id, "Best Nicolas Cage Movie",
			publicKey, ["Raising Arizona (1987)", "Vampire's Kiss (1989)"]);

		const bestMoviePoll = await polls.get(id);
        expect(bestMoviePoll).to.be.eql({
			Id: id,
			Owner: contractOwner.address.slice(2).toLowerCase(),
			Name: "Best Nicolas Cage Movie",
			PublicKey: publicKey,
			Options: ["Raising Arizona (1987)", "Vampire's Kiss (1989)"],
			Results: null,
		});

        expect(await polls.countVotes(id)).to.be.eql(0);

        await polls.vote(id, 0);
        expect(await polls.countVotes(id)).to.be.eql(1);

		// voting the second time should update the vote but not the number of votes
        await polls.vote(id, 1);
        expect(await polls.countVotes(id)).to.be.eql(1);

        await polls.finish(id, privateKey);

        expect((await polls.get(id)).Results).to.be.eql([
			{Name: "Raising Arizona (1987)", Value: 0},
			{Name: "Vampire's Kiss (1989)", Value: 1},
		]);


		let err;
		try {
			await polls.vote(id, 0);
		} catch (e) {
			err = e;
		}
		expect(err).to.be.eql(new Error("Error: results are already in"));
	});
});
