import flowconsole.*;

User user = new User("Alice", "admin");
ReactApp app = new ReactApp();
RestApi api = new RestApi();

user.sendsRequest(app, "Load App");
app.then(api).getDataFrom(api, "Fetch data");
