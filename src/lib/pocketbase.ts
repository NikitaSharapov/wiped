import PocketBase from "pocketbase";
import { writable } from "svelte/store";

export const pb = new PocketBase('https://testovoe.pockethost.io/');

export const authUser = writable(pb.authStore.model);

pb.authStore.onChange((_) => {
  authUser.set(pb.authStore.model);
})