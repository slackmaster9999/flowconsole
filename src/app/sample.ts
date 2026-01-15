import {ReactApp, User } from '../sdk/flowconsole-sdk';

const user = new User('Alice', "admin");
const app = new ReactApp();

user.then(app).sendsRequest(app, 'Load App');
user.sendsRequest(user, 'Fetch Data');