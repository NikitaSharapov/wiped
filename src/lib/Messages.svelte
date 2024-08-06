<script lang="ts">
import { afterUpdate, beforeUpdate, onDestroy, onMount } from "svelte";
import { pb } from "./pocketbase";
import type { AuthRecord, Message, MessageWithUser } from "./interfaces";
import { Button } from "./components/ui/button";
import * as Alert from "$lib/components/ui/alert";
import * as Avatar from "$lib/components/ui/avatar";
import { Input } from "./components/ui/input";
import { ScrollArea } from "$lib/components/ui/scroll-area/";
import { BaseAuthStore, ClientResponseError } from "pocketbase";
import { toast } from "svelte-sonner";
import LoaderCircle from "lucide-svelte/icons/loader-circle";
import LogOut from "lucide-svelte/icons/log-out";
import { navigate, useLocation } from "svelte-routing";
import { getRelativeTimeString } from "./utils";

// TODO: нормально реализоваь поля авторизационных даты и синхронную блокировку кнопок

// TODO: смайлики
let messages: Array<MessageWithUser>;
let authData: BaseAuthStore;
let unsubscribe: () => void;
let message: string = "";

let autoscroll = false;
let messageForm: HTMLFormElement;

let sendIsLoading = false;

beforeUpdate(async () => {
  const el = document.querySelector<HTMLElement>("#scroll");
  if (el) {
    const scrollableDistance = el.scrollHeight - el.offsetHeight;
    autoscroll = el.scrollTop > scrollableDistance - 20;
  }
});

afterUpdate(() => {
  const el = document.querySelector<HTMLElement>("#scroll");
  if (autoscroll && el) {
    el.scrollTo(0, el.scrollHeight);
  }
});

onMount(async () => {
  pb.authStore.onChange(() => {
    if (!pb.authStore.isValid) {
      navigate("/signin", { replace: true });
    }
  }, true);
  await pb.collection("users").authRefresh();
  authData = pb.authStore;
  const messagesList = await pb
    .collection("messages")
    .getList<MessageWithUser>(1, 50, { sort: "created", expand: "user" });
  messages = messagesList.items;
  unsubscribe = await pb.collection("messages").subscribe<MessageWithUser>(
    "*",
    ({ action, record }) => {
      if (action == "create") {
        messages = [...messages, record];
      }
    },
    { expand: "user" },
  );
});

onDestroy(async () => unsubscribe);

async function send() {
  if (message.length != 0) {
    try {
      sendIsLoading = true;
      await pb.collection("messages").create({
        text: message,
        user: pb.authStore.model!.id,
      });
      messageForm.reset();
    } catch (error) {
      if (error instanceof ClientResponseError) {
        const errorMessage = `${Object.keys(error.response.data)[0] ?? ""} ${
          error.response.data[
            Object.keys(error.response.data)[0]
          ]?.message.toLocaleLowerCase() ?? ""
        }`;
        toast.error(error.message, {
          description: errorMessage[0].toUpperCase() + errorMessage.slice(1),
          action: {
            label: "Undo",
            onClick: () => {},
          },
        });
        throw error;
      }

      toast.error("Oops, Something went wrong :(", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
      throw error;
    } finally {
      sendIsLoading = false;
    }
  }
}

function signOut() {
  pb.authStore.clear();
}
</script>

<div class="max-w-screen-lg p-4 m-auto">
  <div class="grid place-content-end">
    <Button class="w-[50px]" on:click="{signOut}">
      <LogOut />
    </Button>
  </div>
  <ScrollArea class="pb-4 h-[calc(100vh-105px)]">
    {#if messages}
      {#if messages.length == 0}
        <h3 class=" text-2xl font-semibold tracking-tight">Wiped</h3>
      {:else}
        {#each messages as message (message.id)}
          {#if pb.authStore.model?.id == message.expand.user.id}
            <div class="grid justify-end my-4">
              <Alert.Root class="grid justify-end grid-cols-[auto_1fr] gap-4">
                <div>
                  <div class="grid grid-cols-[auto_auto] gap-6">
                    <Alert.Title class=""
                      >{message.expand.user.name}</Alert.Title>
                    <small
                      class="text-xs font-normal leading-none text-muted-foreground text-end"
                      >{getRelativeTimeString(
                        new Date(message.created),
                      )}</small>
                  </div>
                  <Alert.Description class="text-end">
                    {message.text}
                  </Alert.Description>
                </div>
                <Avatar.Root>
                  <Avatar.Image
                    src="{message.expand.user.avatar}"
                    alt="avatar" />
                  <Avatar.Fallback>CN</Avatar.Fallback>
                </Avatar.Root>
              </Alert.Root>
            </div>
          {:else}
            <div class="grid justify-start my-4">
              <Alert.Root class="grid justify-start grid-cols-[auto_1fr] gap-4">
                <Avatar.Root>
                  <Avatar.Image
                    src="{message.expand.user.avatar}"
                    alt="@shadcn" />
                  <Avatar.Fallback>CN</Avatar.Fallback>
                </Avatar.Root>
                <div>
                  <div class="grid grid-cols-[auto_auto] gap-6">
                    <Alert.Title class=""
                      >{message.expand.user.name}</Alert.Title>
                    <small
                      class="text-xs font-normal leading-none text-muted-foreground text-end"
                      >{getRelativeTimeString(
                        new Date(message.created),
                      )}</small>
                  </div>
                  <Alert.Description>
                    {message.text}
                  </Alert.Description>
                </div>
              </Alert.Root>
            </div>
          {/if}
        {/each}
      {/if}
    {:else}
      <LoaderCircle class=" h-12  animate-spin" />
    {/if}
  </ScrollArea>
  <form
    class="grid grid-cols-[1fr_70px] gap-4"
    on:submit|preventDefault
    bind:this="{messageForm}">
    <Input
      id="message"
      type="text"
      placeholder="Type message"
      required
      disabled="{!authData?.model?.verified}"
      bind:value="{message}" />
    <Button
      type="submit"
      class="w-full"
      on:click="{send}"
      disabled="{sendIsLoading || !authData?.model?.verified}">
      {#if sendIsLoading}
        <LoaderCircle class=" h-4  animate-spin" />
      {:else}
        Send
      {/if}
    </Button>
  </form>
</div>
