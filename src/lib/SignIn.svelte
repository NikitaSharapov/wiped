<script lang="ts">
import { Button } from "$lib/components/ui/button";
import * as Card from "$lib/components/ui/card";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { pb } from "./pocketbase";
import { toast } from "svelte-sonner";
import LoaderCircle from "lucide-svelte/icons/loader-circle";
import { ClientResponseError } from "pocketbase";
import { link, navigate } from "svelte-routing";

let username: string = "";
let password: string = "";

let signInIsLoading: boolean = false;
let signInWithOAuth2IsLoading: boolean = false;

async function signIn() {
  if (username.length != 0 && password.length != 0) {
    try {
      signInIsLoading = true;
      await pb.collection("users").authWithPassword(username, password);
      toast.info("Success sign in", {
        action: {
          label: "Undo",
          onClick: () => {},
        },
      });
      navigate("/", { replace: true });
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
      signInIsLoading = false;
    }
  }
}

async function signInWithOAuth2(provider: string) {
  try {
    signInWithOAuth2IsLoading = true;
    await pb.collection("users").authWithOAuth2({ provider });
    toast.info("Success sign in", {
      action: {
        label: "Undo",
        onClick: () => {},
      },
    });
    navigate("/", { replace: true });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      const errorMessage = `${Object.keys(error.response.data)[0] ?? ""} ${
        error.response.data[
          Object.keys(error.response.data)[0]
        ]?.message.toLocaleLowerCase() ?? ""
      }`;
      toast.error(error.message, {
        description:
          errorMessage[0].toUpperCase() + errorMessage.slice(1) ?? "",
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
        onClick: () => console.info("Undo"),
      },
    });
    throw error;
  } finally {
    signInWithOAuth2IsLoading = false;
  }
}

// function signOut() {
//   pb.authStore.clear();
// }
</script>

<!-- {#if $authUser}
  <p>Welcome, {$authUser.username}!</p>
  <Messages />
{:else}
  <form class="w-full" on:submit|preventDefault>
    <Input type="text" placeholder="username" bind:value="{username}" />
    <Input type="password" placeholder="password" bind:value="{password}" />
    <Button on:click="{login}" disabled="{loginLoading}" class="w-full">
      {#if loginLoading}
        <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
      {/if}Login</Button>
    <Button on:click="{signUp}">SignUp</Button>
  </form>
{/if} -->
<div class="grid place-items-center h-screen">
  <Card.Root class="mx-auto max-w-sm">
    <Card.Header>
      <Card.Title class="text-2xl">Sign in</Card.Title>
      <Card.Description
        >Enter your username or email below to login to your account</Card.Description>
    </Card.Header>
    <Card.Content>
      <form class="grid gap-4" on:submit|preventDefault>
        <div class="grid gap-2">
          <Label for="email">Username or Email</Label>
          <Input
            id="username"
            type="text"
            required
            placeholder="m@example.com or jask123"
            bind:value="{username}" />
        </div>
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a href="##" class="ml-auto inline-block text-sm underline">
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            required
            type="password"
            placeholder="••••••••"
            bind:value="{password}" />
        </div>
        <Button
          type="submit"
          class="w-full"
          on:click="{signIn}"
          disabled="{signInIsLoading}">
          {#if signInIsLoading}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          {:else}
            Login
          {/if}
        </Button>
        <!-- <Button
          variant="outline"
          class="w-full"
          disabled="{signInWithOAuth2IsLoading}"
          on:click="{() => signInWithOAuth2('google')}">
          {#if signInWithOAuth2IsLoading}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          {:else}
            Sign in with Google
          {/if}</Button> -->
      </form>
      <div class="mt-4 text-center text-sm">
        Don&apos;t have an account?
        <a href="/signup" use:link class="underline">Sign up</a>
      </div>
      <div class="relative p-6">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t"></span>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        class="w-full"
        disabled="{signInWithOAuth2IsLoading}"
        on:click="{() => signInWithOAuth2('google')}">
        {#if signInWithOAuth2IsLoading}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {:else}
          Google
        {/if}</Button>
    </Card.Content>
  </Card.Root>
</div>
