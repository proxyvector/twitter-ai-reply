<script setup>
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { onMounted } from "vue";
import { ref } from "vue";

// defining state

let name = ref("");
let email = ref("");
let openaikey = ref("");
let description = ref("");

function saveUserData() {
  console.log("Save User Data");

  var dataDict = {
    name: name.value,
    email: email.value,
    openai_api_key: openaikey.value,
    description: description.value,
  };
  chrome.storage.sync.set(dataDict, function () {
    console.log("Value is set to ");
    console.log(dataDict);
  });
}

onMounted(async () => {
  console.log("mounted");
  const data = await chrome.storage.sync.get([
    "name",
    "email",
    "openai_api_key",
    "description",
  ]);

  name.value = data.name;
  email.value = data.email;
  openaikey.value = data.openai_api_key;
  description.value = data.description;
});
</script>

<template>
  <Card class="w-[350px]">
    <CardHeader>
      <div class="flex justify-between space-x-4">
        <CardTitle>Twitter AI Reply</CardTitle>
        <Avatar>
          <AvatarImage src="icons/logo_128px.png" alt="@radix-vue" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <CardDescription>Setup your details</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Name</Label>
            <Input id="name" v-model="name" placeholder="Your Full Name" />
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Email</Label>
            <Input
              id="email"
              v-model="email"
              placeholder="Your Email Address"
            />
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Openai API Key</Label>
            <Input
              id="openai-key"
              v-model="openaikey"
              placeholder="Your openai API key"
            />
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label>Describe Yourself</Label>
            <Textarea
              id="description"
              v-model="description"
              placeholder="Your description will be used to give personality to the AI"
            />
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button variant="outline" @click="fetchUserData"> Cancel </Button>
      <Button @click="saveUserData">Save</Button>
    </CardFooter>
  </Card>
</template>

<style scoped></style>
