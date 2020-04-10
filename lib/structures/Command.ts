import Base from './Base'
import { Cooldown } from '../QuartzTypes'
import { Client } from '..'

interface Argument {
  key?: string
  type?: string
  prompt?: string | ((msg: any) => void)
  default?: string | ((msg: any) => void)
}

/** Command Class */
class Command extends Base {
  /**
   * Create the eventHandler
   * @param {object} client - Client object
   * @param {object} options - Options object
   */
  name: string
  aliases: string[]
  args: Argument[]
  channel: string | null
  ownerOnly: boolean
  guildOnly: boolean
  devOnly: boolean
  description: string
  botPermissions: any
  userPermissions: any
  cooldown: Cooldown

  constructor (client: Client, options = {}) {
    super(client)
    const {
      name = '',
      aliases = [],
      args = [],
      channel = null,
      ownerOnly = false,
      guildOnly = true,
      devOnly = false,
      description = '',
      cooldown = {
        expires: 5000,
        command: 2
      },
      botPermissions = this.botPermissions,
      userPermissions = this.userPermissions
    }: any = options

    this.name = name
    this.aliases = aliases
    this.args = args
    this.channel = channel
    this.ownerOnly = Boolean(ownerOnly)
    this.guildOnly = Boolean(guildOnly)
    this.devOnly = Boolean(devOnly)
    this.description = description
    this.cooldown = cooldown
    this.botPermissions = typeof botPermissions === 'function' ? botPermissions.bind(this) : botPermissions
    this.userPermissions = typeof userPermissions === 'function' ? userPermissions.bind(this) : userPermissions
  }

  /**
   * Run when command called
   */
  run () {
    throw new Error(`${this.constructor.name}#run has not been implemented`)
  }
}
export default Command
