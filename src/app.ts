import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as path from 'path'
import * as events from 'events'

export default class App {
  private app: express.Application;

  private constructor() {
    this.app = express()
    this.config()
    this.routes()
  }

  public static create(): express.Application {
    return new App().app
  }

  private config(): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: false }))
  }

  private routes(): void {
    const router = express.Router()
    const emitter = new events.EventEmitter()

    router.get('/', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, '..', 'index.html'))
    })

    router.put('/person', (req: express.Request, res: express.Response) => {
      res.sendStatus(200)

      const person = req.body
      const randomSeconds = Math.round(Math.random() * 9) + 1

      setTimeout(() => {
        emitter.emit('person_updated', { type: 'person', data: { person, dateTime: App.formatDate(new Date()) } })
      }, randomSeconds * 1000)
    })

    router.get('/events', (req: express.Request, res: express.Response) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      setInterval(() => {
        res.write(`data: ${JSON.stringify({type: 'date', data: App.formatDate(new Date())})}\n\n`)
      }, 1000);

      res.write(`data: ${JSON.stringify({ type: 'date', data: App.formatDate(new Date()) })}\n\n`)

      emitter.on('person_updated', (person) => {
        res.write(`data: ${JSON.stringify(person)}\n\n`)
      })
    })
    // route to register events

    this.app.use('/', router)
  }

  private static formatDate(date: Date): string {
    return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  }
}
