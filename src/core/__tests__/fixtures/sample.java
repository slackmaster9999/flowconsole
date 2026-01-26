import flowconsole.sdk.*;
import java.util.List;

User user = new User(UserArgs.builder()
  .name("user")
  .description("Administrator user")
  .tags(List.of("admin", "user"))
  .badge("gold")
  .build());

ReactApp app = new ReactApp(ComponentArgs.builder()
  .name("app")
  .build());

RestApi api = new RestApi(ComponentArgs.builder()
  .name("api")
  .belongsTo(app)
  .icon("api-icon")
  .build());

user.sendsRequest(app, "Load App");
app.then(api);
