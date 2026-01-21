import type { User, ReactApp } from "../../../sdk/flowconsole-sdk";

const user: User = { name: 'Alice' };
const app: ReactApp = { name: 'ReactApp' };

user.sendsRequest(app, "Load App");
