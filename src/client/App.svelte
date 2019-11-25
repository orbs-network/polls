<script>
import { isEmpty } from "lodash";
import { v4 } from "uuid";
export let client;
export let polls;
let poll = {

};

let anotherPoll = {};

let answer;

function getCurrentPollId() {
    return document.location.hash.slice(1)
}

async function createPoll() {
    const id = v4();
    try {
        const options = anotherPoll.Options.split("\n").filter(x => !x.isEmpty);
        await polls.create(id, anotherPoll.Name, "fake public key", options);
        document.location.hash = id;
        
    } catch (e) {
        console.log(e);
    }
}

async function submitAnswer() {

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
{:else}
<p>You don't have any active polls, do you want to create one?</p>

<div class="new-poll">
<input bind:value={anotherPoll.Name} placeholder="enter the question for the audience"><br/>
<textarea bind:value={anotherPoll.Options} placeholder="enter poll options separated by new lines" rows=10></textarea><br/>
<button on:click|preventDefault={createPoll}>create poll</button>
</div>
{/if}

<p>{answer}</p>