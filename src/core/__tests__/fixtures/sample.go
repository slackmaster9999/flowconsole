package main

import "github.com/slackmaster9999/flowconsole"

user := flowconsole.NewUser(jsii.String("Alice"), jsii.String("admin"))
app := flowconsole.NewReactApp()
api := flowconsole.NewRestApi()

user.SendsRequest(app, jsii.String("Load App"))
app.Then(api).GetDataFrom(api, jsii.String("Fetch data"))
