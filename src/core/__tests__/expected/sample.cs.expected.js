export default {
  "nodes": [
    {
      "badge": "gold",
      "className": "User",
      "description": "Administrator user",
      "icon": undefined,
      "name": "user",
      "parentId": undefined,
      "sourceLine": "3 - 8",
      "tags": ["admin", "user"]
    },
    {
      "badge": undefined,
      "className": "ReactApp",
      "description": undefined,
      "icon": undefined,
      "name": "app",
      "parentId": undefined,
      "sourceLine": "10 - 12",
      "tags": undefined
    },
    {
      "badge": undefined,
      "className": "RestApi",
      "description": undefined,
      "icon": "api-icon",
      "name": "api",
      "parentId": "app",
      "sourceLine": "14 - 18",
      "tags": undefined
    }
  ],
  "flows": [
    {
      "label": "SendsRequest",
      "kind": "async",
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
};
