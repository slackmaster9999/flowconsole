package main

import . "github.com/slackmaster9999/flowconsole"

user := NewUser(&UserArgs{
    Name:        "user",
    Description: "Administrator user",
    Tags:        []string{"admin", "user"},
    Badge:       "gold",
})

app := NewReactApp(&ReactAppArgs{
    Name: "app",
})

api := NewRestApi(&RestApiArgs{
    Name: "api",
})

user.SendsRequest(app, "Load App")
app.Then(api)
