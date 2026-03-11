from flowconsole import User, ReactApp, RestApi

user = User(name='Alice', role='admin', description='Administrator user', tags=['admin', 'user'], badge='gold')
app = ReactApp(name='Dashboard')
api = RestApi(name='Backend API')

user.sendsRequest(app, 'Load App')
app.then(api)
