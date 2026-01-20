from flowconsole import User, ReactApp, RestApi

user = User('Alice', 'admin')
app = ReactApp()
api = RestApi()

user.sendsRequest(app, 'Load App')
app.then_(api).getDataFrom(api, 'Fetch data')
