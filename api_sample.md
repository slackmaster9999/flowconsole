```typescript
// You start with defining users
const user: User = { name: "Customer", description: "Customer of Cloud System" };

// Then you define your system and it's modules
const system: ComputerSystem = { name: "Cloud System" };
const storage: Container = { name: "Data Store", system: system };
const backend: Container = { name: "Backend", system: system };

// Now you are ready to add components(microservices, cache, db, etc)
const frontApp: ReactApp = {
  name: "Customer Dashboard",
  description: "Browser Single-page Application",
  belongsTo: system
};
const authApi: RestApi = {
  name: "Authentication",
  description: "Self-Hosted Authentication Service",
  belongsTo: backend
};

const backendApi: RestApi = {
  name: "Java Spring Web-service",
  description: "provides access via REST API",
  belongsTo: backend
};

const cache: Redis = {
  name: "Session Data",
  description: "Storage with temporary, session-only data",
  belongsTo: storage
};

const db: Postgres = {
  name: "Persistent Data",
  description: "Relational Database",
  belongsTo: storage
};

// now you can define how request flows in your system
// or how components are connected, it's up to you to decide :)
user.sendsRequestTo(frontApp, "open in browser")
    .then(frontApp).sendsRequestTo(authApi, "updates token if needed")
    .then(frontApp).sendsRequestTo(backendApi, "GET request")
    .sendsRequestTo(authApi, "validates bearer token")
    .inParallel(
      () => backendApi.getDataFrom(cache, "requests session data"),
      () => backendApi.getDataFrom(db, "requests persistent data")
    )
    .then(backendApi).executesRequest("process");
```