<script>
import { isEmpty } from "lodash";
import { v4 } from "uuid";
export let account;
export let polls;
export let config;

let poll = {

};
let isOwner = false;
let alreadyVoted = false;
let anotherPoll = {};
let answer;
let results;

function getCurrentPollId() {
    return document.location.hash.slice(1);
}

async function checkOwnership() {
    isOwner = poll.Owner == (await account.getAddress()).slice(2).toLowerCase();
}

async function checkIfAlreadyVoted() {
    // alreadyVoted 
}

async function createPoll() {
    const id = v4();
    try {
        const options = anotherPoll.Options.split("\n").filter(x => !x.isEmpty);
        await polls.create(id, anotherPoll.Name, config.publicKey, options);
        document.location.hash = id;
        render();
    } catch (e) {
        console.log(e);
    }
}

async function submitAnswer() {
    if (isEmpty(answer)) {
        throw new Error("please select the answer first")
    }
    await polls.vote(getCurrentPollId(), answer);
    alreadyVoted = true;
}

async function endPoll() {
    await polls.finish(getCurrentPollId(), config.privateKey);
    results = await polls.results(getCurrentPollId());
}

async function render() {
    try {
        console.log(getCurrentPollId())
        poll = await polls.get(getCurrentPollId());
        console.log(poll)
        await checkOwnership();
    } catch (e) {
        console.log(e);
    }
}

render();
</script>

{#if !isEmpty(poll.Name)}
<h1>{poll.Name}</h1>

{#if !alreadyVoted}
<div class="poll">
    {#each poll.Options as option, i}
    <div class="option">
    <input type="radio" id="answer-{i}" name="answer" value="{i}" on:click={(e) => answer = e.target.value}>
    <label for="answer-{i}">{option}</label><br/>
    </div>
    {/each}
</div>
{:else}
Thank you for voting!
{/if}

<div class="buttons">
{#if !alreadyVoted}<button on:click|preventDefault={submitAnswer}>submit answer</button>{/if}
{#if isOwner}
<button on:click|preventDefault={endPoll}>finish the poll</button>
{/if}
</div>

{:else}
<h1>Creating a new poll</h1>

<div class="new-poll">
<input type="text" bind:value={anotherPoll.Name} placeholder="enter the question for the audience"><br/>
<textarea bind:value={anotherPoll.Options} placeholder="enter poll options separated by new lines" rows=10></textarea><br/>
<div class="buttons">
<button on:click|preventDefault={createPoll}>create poll</button>
</div>
</div>
{/if}

{#if !isEmpty(results)}
<pre>
{JSON.stringify(poll, 2, 2)}
{JSON.stringify(results, 2, 2)}
</pre>
{/if}