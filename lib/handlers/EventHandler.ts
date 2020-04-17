import { sep, resolve } from 'path'
import { readdirSync } from 'fs'
import Eris, { Collection } from 'eris'
import { ClientOptions, Message as MessageTyping } from '../typings'
import Command from '../structures/Command'
import Client from '../client'
import Message from '../structures/Message'

const quartzEvents = ['missingPermission', 'commandRun', 'ratelimited']

/** EventHandler Class */
class EventHandler {
  private readonly _client: Client
  directory: string
  debug: boolean
  events: Collection<any>

  /**
   * Create the eventHandler
   * @param {object} quartz - QuartzClient object
   * @param {object} options - eventHandler options
   */
  constructor (client: Client, options: ClientOptions['eventHandler'] = { directory: './commands', debug: false }) {
    this._client = client
    this.directory = options.directory
    this.debug = options.debug
    this.events = new Collection(null)
  }

  /**
   * Get the eris client object
   * @return {object} The eris client object.
   */
  get client (): Client {
    return this._client
  }

  /**
   * Load the events from the folder
   */
  async loadEvents (): Promise<void> {
    const files = await readdirSync(this.directory).filter((f: string) => f.endsWith('.js') || f.endsWith('.ts'))
    if (files.length <= 0) throw new Error(`No files found in events folder '${this.directory}'`)
    await files.forEach(async (file: string) => {
      let Event = await import(resolve(`${this.directory}${sep}${file}`))
      if (typeof Event !== 'function') Event = Event.default
      const evt = new Event(this.client)
      if (!evt) throw new Error(`Event ${this.directory}${sep}${file} file is empty`)
      if (!evt.name) throw new Error(`Event ${this.directory}${sep}${file} is missing a name`)
      if (this.events.get(evt.name)) throw new Error(`Event ${this.directory}${sep}${file} already exists`)
      this.events.set(evt.name, evt)
      if (this.debug) this._client.logger.info(`Loading event ${evt.name}`)
      if (quartzEvents.includes(evt.name)) this._client.on(evt.name, evt.run.bind(this))
      else if (evt.name === 'messageCreate') return undefined
      else if (evt.name === 'ready') this.client.once(evt.name, evt.run.bind(this))
      else this.client.on(evt.name, evt.run.bind(this))
    })
  }

  /**
   * Runs event
   * @param {object} msg - The message object
   */
  async _onMessageCreate (_msg: Eris.Message): Promise<void> {
    try {
      if (!_msg.author || _msg.author.bot) return
      const msg: MessageTyping = new Message(_msg, this.client) as unknown as MessageTyping
      await msg._configure()
      msg.command = null
      const content: string = msg.content.toLowerCase()
      const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (Array.isArray(msg?.prefix)) {
        if (msg.prefix.length <= 0) msg.prefix = null
        else {
          msg.prefix.forEach((p: string) => escapeRegex(p))
          const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${msg.prefix.join('|')})\\s*`)
          const matchedPrefix = prefixRegex.test(content) && content.match(prefixRegex) ? content.match(prefixRegex)[0] : undefined
          if (matchedPrefix) msg.prefix = matchedPrefix
          else msg.prefix = null
        }
      } else if (msg?.prefix) {
        const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(msg.prefix.toLowerCase())})\\s*`)
        const matchedPrefix = prefixRegex.test(content) && content.match(prefixRegex) ? content.match(prefixRegex)[0] : undefined
        if (matchedPrefix) msg.prefix = matchedPrefix
        else msg.prefix = null
      }
      if (msg?.prefix) {
        const args: string[] = msg.content.substring(msg.prefix.length).split(' ')
        const label: string = args.shift().toLowerCase()
        const command: Command = await this._client.commandHandler.getCommand(label)
        if (command) {
          // @ts-ignore
          msg.command = command
          await this._client.commandHandler.handleCommand(msg, msg.command, args)
        }
      }
      if ((this._client._options.eventHandler.commands && msg.command) || !msg.command) {
        const event = this.events.get('messageCreate')
        return event.run.call(this, msg)
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export default EventHandler
