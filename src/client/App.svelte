<script>
import { isEmpty } from "lodash";
import { v4 } from "uuid";
export let account;
export let polls;
export let identity;
export let config;

let poll = {

};
let isOwner = false;
let alreadyVoted = false;
let anotherPoll = {};
let answer;

let myIdentity;

function getCurrentPollId() {
    return document.location.search.slice(1);
}

async function checkOwnership() {
    isOwner = (poll.Owner == await getIdentity());
}

async function checkIfAlreadyVoted() {
    alreadyVoted = await polls.hasVoted(getCurrentPollId());
}

async function createPoll() {
    const id = v4();
    try {
        const options = anotherPoll.Options.split("\n").filter(x => !x.isEmpty);
        await polls.create(id, anotherPoll.Name, config.publicKey, options);
        document.location.search = id;
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
    await render();
}

async function render() {
    try {
        poll = await polls.get(getCurrentPollId());
        await checkOwnership();
        await checkIfAlreadyVoted();
    } catch (e) {
        console.log(e);
    }
}

async function getIdentity() {
    myIdentity = await identity.getIdByAddress(await account.getAddress());
    return myIdentity;
}

getIdentity();
setInterval(getIdentity, 5000); // try every 5s

render();
</script>

{#if !isEmpty(poll.Name)}
<h1>{poll.Name}</h1>

{#if isEmpty(poll.Results)}
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
<p>The results are in!</p>

{#each poll.Results as { Name, Value}}
    <ul>
    <li>{Name}: {Value}</li>
    </ul>
    {/each}
{/if}

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

<div class="identity">
{#if isEmpty(myIdentity)}
<p>You are not signed in! Only signed in users can create polls.</p>
<p>Please sign in <a href="{config.signInUrl}" target="_blank">here</a></p>
{:else}
<p>You are signed in as <span class="id">{myIdentity}</span></p>
{/if}
</div>