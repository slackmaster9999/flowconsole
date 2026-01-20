const user = { name: 'Alice' };
const app = { type: 'ReactApp' };

class User {
  sendsRequest(target: any) { return this; }
  then(target: any) { return target; }
}

const alice = new User();
const webapp = new User();

alice.sendsRequest(webapp);
