import { ReactApp, User } from "@flowconsole/sdk";

const user = new User({
  name: "Alice",
  role: "admin",
  description: "Administrator user",
  tags: ["admin", "user"],
  badge: "gold",
  tone: "muted",
});

const app = new ReactApp({});

user.sendsRequest(app, "Load App");
