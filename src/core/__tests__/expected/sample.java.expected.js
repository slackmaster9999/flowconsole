export default {
  "nodes": [
    {
      "badge": "gold",
      "className": "User",
      "description": "Administrator user",
      "icon": undefined,
      "name": "user",
      "parentId": undefined,
      "sourceLine": "4 - 9",
      "tags": ["admin", "user"]
    },
    {
      "badge": undefined,
      "className": "ReactApp",
      "description": undefined,
      "icon": undefined,
      "name": "app",
      "parentId": undefined,
      "sourceLine": "11 - 13",
      "tags": undefined
    },
    {
      "badge": undefined,
      "className": "RestApi",
      "description": undefined,
      "icon": "api-icon",
      "name": "api",
      "parentId": "app",
      "sourceLine": "15 - 19",
      "tags": undefined
    }
  ],
  "flows": [
    {
      "label": "sendsRequest",
      "kind": "sync",
      "text": "user.sendsRequest(app, \"Load App\")",
      "sourceName": "user",
      "targetName": "app"
    },
    {
      "label": "then",
      "kind": "sync",
      "text": "app.then(api)",
      "sourceName": "app",
      "targetName": "api"
    }
  ]
};
