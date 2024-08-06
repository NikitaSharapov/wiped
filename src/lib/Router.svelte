<script lang="ts">
import { Router, Route } from "svelte-routing";

import SignIn from "./SignIn.svelte";
import SignUp from "./SignUp.svelte";
import Messages from "./Messages.svelte";

export let url = "";
</script>

<Router url="{url}">
  <Route path="/signin"><SignIn /></Route>
  <Route path="/signup"><SignUp /></Route>
  <Route path="/"><Messages /></Route>

  <Route>
    <h2
      class="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
      404
    </h2></Route>
</Router>
