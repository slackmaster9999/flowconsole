export default {
  "nodes": [
    {
      "badge": "gold",
      "className": "User",
      "description": "Administrator user",
      "icon": undefined,
      "name": "user",
      "parentId": undefined,
      "sourceLine": "3 - 3",
      "tags": ["admin", "user"]
    },
    {
      "badge": undefined,
      "className": "ReactApp",
      "description": undefined,
      "icon": undefined,
      "name": "app",
      "parentId": undefined,
      "sourceLine": "4 - 4",
      "tags": undefined
    },
    {
      "badge": undefined,
      "className": "RestApi",
      "description": undefined,
      "icon": undefined,
      "name": "api",
      "parentId": undefined,
      "sourceLine": "5 - 5",
      "tags": undefined
    }
  ],
  "flows": [
    {
      "label": "sendsRequest",
      "kind": "async",
      "text": "user.sendsRequest(app, 'Load App')",
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
}
