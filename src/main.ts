import App from './app'
import * as events from 'events'
const port = 8080

const app = App.create()

app.listen(port, () => console.log('App listening on port', port))
