import { ReactApp, User } from "@flowconsole/sdk";

const user = new User('Alice', "admin");
const app = new ReactApp();

user.sendsRequest(app, "Load App");
