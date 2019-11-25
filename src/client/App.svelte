<script>
import { isEmpty } from "lodash";
export let client;
export let polls;
let poll = {

};

(async () => {
    try {
        poll = await polls.get("default-poll");
    } catch (e) {
        console.log(e);
    }
    
})();
</script>

{#if !isEmpty(poll.Name)}
<pre>
{JSON.stringify(poll, 2, 2)}
</pre>
{:else}
You don't have any active polls, do you want to create one?
{/if}