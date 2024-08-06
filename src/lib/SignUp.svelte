<script lang="ts">
import { Button } from "$lib/components/ui/button/";
import * as Card from "$lib/components/ui/card/";
import { Input } from "$lib/components/ui/input/";
import { Label } from "$lib/components/ui/label/";
import { toast } from "svelte-sonner";
import { pb } from "./pocketbase";
import LoaderCircle from "lucide-svelte/icons/loader-circle";
import { ClientResponseError } from "pocketbase";
import { nanoid } from "nanoid";
import { navigate } from "svelte-routing";
import { link } from "svelte-routing";

let username: string = "";
let email: string = "";
let password: string = "";

let signupIsLoading: boolean = false;
let signInWithOAuth2IsLoading: boolean = false;

async function signup() {
  if (username.length != 0 && password.length != 0 && email.length != 0) {
    try {
      signupIsLoading = true;
      await pb.collection("users").create({
        avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${nanoid()}`,
        username,
        email,
        password,
        passwordConfirm: password,
        name: username,
      });
      await pb.collection("users").authWithPassword(username, password);
      toast.info("Success sign up", {
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
          onClick: () => {},
        },
      });
      throw error;
    } finally {
      signupIsLoading = false;
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
        onClick: () => console.info("Undo"),
      },
    });
    throw error;
  } finally {
    signInWithOAuth2IsLoading = false;
  }
}
</script>

<div class="grid place-items-center h-screen">
  <div>
    <Card.Root class="mx-auto max-w-sm">
      <Card.Header>
        <Card.Title class="text-xl">Sign up</Card.Title>
        <Card.Description
          >Enter your information to create an account</Card.Description>
      </Card.Header>
      <Card.Content>
        <form class="grid gap-4" on:submit|preventDefault>
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="first-name">Username</Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                bind:value="{username}" />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              bind:value="{email}"
              type="email"
              placeholder="m@example.com"
              required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              bind:value="{password}" />
          </div>
          <Button
            type="submit"
            class="w-full"
            on:click="{signup}"
            disabled="{signupIsLoading}">
            {#if signupIsLoading}
              <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
            {:else}
              Create an account
            {/if}
          </Button>
        </form>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <a href="/signin" use:link class="underline">Sign in</a>
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
    <p class="text-muted-foreground px-8 text-center text-sm pt-6">
      By clicking continue, you agree to our
      <a href="/terms" class="hover:text-primary underline underline-offset-4">
        Terms of Service
      </a>
      and
      <a
        href="/privacy"
        class="hover:text-primary underline underline-offset-4">
        Privacy Policy
      </a>
      .
    </p>
  </div>
</div>
