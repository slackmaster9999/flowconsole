export default {
  "nodes": [
    {
      "badge": "gold",
      "className": "User",
      "description": "Administrator user",
      "icon": undefined,
      "name": "user",
      "parentId": undefined,
      "sourceLine": "5 - 10",
      "tags": ["admin", "user"]
    },
    {
      "badge": undefined,
      "className": "ReactApp",
      "description": undefined,
      "icon": undefined,
      "name": "app",
      "parentId": undefined,
      "sourceLine": "12 - 14",
      "tags": undefined
    },
    {
      "badge": undefined,
      "className": "RestApi",
      "description": undefined,
      "icon": undefined,
      "name": "api",
      "parentId": undefined,
      "sourceLine": "16 - 18",
      "tags": undefined
    }
  ],
  "flows": [
    {
      "label": "SendsRequest",
      "kind": "sync",
      "text": "user.SendsRequest(app, \"Load App\")",
      "sourceName": "user",
      "targetName": "app"
    },
    {
      "label": "Then",
      "kind": "sync",
      "text": "app.Then(api)",
      "sourceName": "app",
      "targetName": "api"
    }
  ]
}
