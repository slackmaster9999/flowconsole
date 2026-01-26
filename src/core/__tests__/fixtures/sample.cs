using FlowConsole;

var user = new User("Alice", "admin");
var app = new ReactApp();
var api = new RestApi();

user.SendsRequest(app, "Load App");
app.GetDataFrom(api, "Fetch data");
