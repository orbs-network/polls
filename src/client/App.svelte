<script>
import { isEmpty } from "lodash";
import { v4 } from "uuid";
export let client;
export let polls;
export let config;

let poll = {

};
let anotherPoll = {};
let answer;
let results;

function getCurrentPollId() {
    return document.location.hash.slice(1)
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
}

async function endPoll() {
    await polls.finish(getCurrentPollId(), config.privateKey);
    results = await polls.results(getCurrentPollId());
}

async function render() {
    try {
        poll = await polls.get(getCurrentPollId());
    } catch (e) {
        console.log(e);
    }
}

render();
</script>

{#if !isEmpty(poll.Name)}
<h1>{poll.Name}</h1>
    {#each poll.Options as option, i}
    <input type="radio" id="answer-{i}" name="answer" value="{i}" on:click={(e) => answer = e.target.value}>
    <label for="answer-{i}">{option}</label><br/>
    {/each}
<button on:click|preventDefault={submitAnswer}>submit answer</button>

<p><strong>owner only</strong></p>
<button on:click|preventDefault={endPoll}>finish the poll</button>

{:else}
<p>You don't have any active polls, do you want to create one?</p>

<div class="new-poll">
<input bind:value={anotherPoll.Name} placeholder="enter the question for the audience"><br/>
<textarea bind:value={anotherPoll.Options} placeholder="enter poll options separated by new lines" rows=10></textarea><br/>
<button on:click|preventDefault={createPoll}>create poll</button>
</div>
{/if}

<p>{answer}</p>

{#if !isEmpty(results)}
<pre>
{JSON.stringify(poll, 2, 2)}
{JSON.stringify(results, 2, 2)}
</pre>
{/if}