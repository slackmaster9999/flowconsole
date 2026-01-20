import { User, ReactApp, RestApi } from '@flowconsole/sdk';

const user = new User('Alice', 'admin');
const app = new ReactApp();
const api = new RestApi();

user.sendsRequest(app, 'Load App');
app.then(api).getDataFrom(api, 'Fetch data');
