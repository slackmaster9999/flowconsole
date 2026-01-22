export default {
  "nodes": [
    {"badge": "gold",
      "className": "User",
      "description": "Administrator user",
      "icon": undefined,
      "name": "user",
      "parentId": undefined,
      "tags":  ["admin", "user"],
      sourceLine: "3 - 10"
    },
    {
      "badge": undefined,
      "className": "ReactApp",
      "description": undefined,
      "icon": undefined,
      "name": "app",
      "parentId": undefined,
      "tags": undefined,
      sourceLine: "12 - 12"
    }
  ],
  "flows": [
    {
      "label": "sendsRequest",
      "kind": "async",
      "text": "user.sendsRequest(app, \"Load App\")",
      "sourceName": "user",
      "targetName": "app"
    }
  ]
}
