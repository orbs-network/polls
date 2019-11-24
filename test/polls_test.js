const expect = require("expect.js");
const { createAccount, LocalSigner, encodeHex } = require("orbs-client-sdk");
const { Polls } = require("../src/polls");
const { deployPolls, getClient } = require("../src/deploy_polls");

function sleep(timeout) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, timeout);
	})
}

describe("Polls", () => {
    it("updates contract state", async () => {
		const contractOwner = createAccount();
		const contractName = "Polls" + new Date().getTime();

		const signer = new LocalSigner(contractOwner);
		await deployPolls(getClient(signer), contractName);
		const polls = new Polls(getClient(signer), contractName);

		const emptyPoll = await polls.get("best-nicolas-cage-movie");
		expect(emptyPoll.Name).to.be.eql("");

        await polls.create("best-nicolas-cage-movie", "Best Nicolas Cage Movie",
			"010203", ["Raising Arizona (1987)", "Vampire's Kiss (1989)"]);

        const bestMoviePoll = await polls.get("best-nicolas-cage-movie");
        expect(bestMoviePoll).to.be.eql({
			Id: "best-nicolas-cage-movie",
			Owner: contractOwner.address.slice(2).toLowerCase(),
			Name: "Best Nicolas Cage Movie",
			PublicKey: "010203",
            Options: ["Raising Arizona (1987)", "Vampire's Kiss (1989)"]
		});

        expect(await polls.countVotes("best-nicolas-cage-movie")).to.be.eql(0);

        await polls.vote("best-nicolas-cage-movie", 1);

        expect(await polls.countVotes("best-nicolas-cage-movie")).to.be.eql(1);

        expect(await polls.results("best-nicolas-cage-movie")).to.be.eql({
			"Vampire's Kiss (1989)": 1,
		})
	});
});
