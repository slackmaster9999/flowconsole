using FlowConsole;

var user = new User(new UserArgs {
  Name = "user",
  Description = "Administrator user",
  Tags = new [] { "admin", "user" },
  Badge = "gold",
});

var app = new ReactApp(new ComponentArgs {
  Name = "app",
});

var api = new RestApi(new ComponentArgs {
  Name = "api",
  BelongsTo = app,
  Icon = "api-icon",
});

user.SendsRequest(app, "Load App");
app.Then(api);
