import Eris from 'eris'
import { Client, Embed } from '..'
import { EmbedOptions } from '../typings'
import util from 'util'

const prefix = (msg: Eris.Message, _prefix: Function | string | string[]): string | string[] => {
  if (typeof _prefix === 'function') {
    if (util.types.isAsyncFunction(_prefix)) {
      return _prefix(msg)
        .then((prefix: string | string[]) => prefix)
        .catch((error: Error) => {
          throw new Error(error.message)
        })
    }
    return _prefix(msg)
  } else return _prefix
}

const color = (msg: Eris.Message, _color: Function | string | number): string | number => {
  if (typeof _color === 'function') {
    if (util.types.isAsyncFunction(_color)) {
      return _color(msg)
        .then((color: string | number) => color)
        .catch((error: Error) => {
          throw new Error(error.message)
        })
    }
    return _color(msg)
  } else return _color
}

const text = (msg: Eris.Message, _text: Function | string): string => {
  if (typeof _text === 'function') {
    if (util.types.isAsyncFunction(_text)) {
      return _text(msg)
        .then((text: string) => text)
        .catch((error: Error) => {
          throw new Error(error.message)
        })
    }
    return _text(msg)
  } else return _text
}

const logo = (msg: Eris.Message, _logo: Function | string): string => {
  if (typeof _logo === 'function') {
    if (util.types.isAsyncFunction(_logo)) {
      return _logo(msg)
        .then((logo: string) => logo)
        .catch((error: Error) => {
          throw new Error(error.message)
        })
    }
    return _logo(msg)
  } else return _logo
}

class Message extends Eris.Message {
  private readonly _settings: Function | any

  readonly client: Client
  color: string | number
  text: string
  logo: string
  guild?: Eris.Guild
  // @ts-ignore
  prefix?: string | string[]

  constructor (msg: Eris.Message, client: Client) {
    super({
      id: msg.id,
      channel_id: msg.channel.id,
      author: msg.author
    }, client)
    this.client = client
    const _prefix = prefix(msg, this.client._options?.commandHandler?.prefix)
    this.guild = msg.member?.guild || null
    this.prefix = _prefix
    this.color = color(msg, this.client._options?.commandHandler?.color)
    this.text = text(msg, this.client._options?.commandHandler?.text)
    this.logo = logo(msg, this.client._options?.commandHandler?.logo)
    this.content = msg.content.replace(/<@!/g, '<@')
  }

  /**
   * Return a embed
   * @param {string} message - The embed content
   * @param {object} options - The embed options
   * @return {object} The embed
   */
  async embed (message: string, options?: EmbedOptions): Promise<Message> {
    return await new Promise((resolve, reject) => {
      const generateEmbed = new Embed()
      if (!options) options = { reply: false, bold: false, color: null, footer: false, text: false }
      if (options.reply && !options.bold) message = `<@${this.author.id}>, ${message}`
      else if (options.bold && !options.reply) message = `**${message}**`
      else if (options.bold && options.reply) message = `**<@${this.author.id}>, ${message}**`
      if (options.text) {
        this.channel.createMessage(message)
          .then((erisMsg) => resolve(new Message(erisMsg, this.client)))
          .catch((error) => reject(error))
        return
      }
      generateEmbed.setDescription(message)
      if (options.color) generateEmbed.setColor(options.color)
      else generateEmbed.setColor(this.color)
      if (options.footer) generateEmbed.setFooter(this.text, this.logo)
      this.channel.createMessage({ embed: generateEmbed })
        .then((erisMsg) => resolve((new Message(erisMsg, this.client))))
        .catch((error) => reject(error))
    })
  }

  /**
   * Get server settings
   * @param {object} msg - The message object
   * @return {object} The settings object
   */
  settings (): any {
    if (typeof this.client._options?.commandHandler?.settings === 'function') {
      if (util.types.isAsyncFunction(this.client._options?.commandHandler?.settings)) {
        return this.client._options?.commandHandler?.settings(this)
          .then((settings: any) => settings)
          .catch((error: Error) => {
            throw new Error(error.message)
          })
      }
      return this.client._options?.commandHandler?.settings(this)
    } else return this.client._options?.commandHandler?.settings
  }
}

export default Message
