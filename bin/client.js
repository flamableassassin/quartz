"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LogHandler_1 = __importDefault(require("./handlers/LogHandler"));
const EventHandler_1 = __importDefault(require("./handlers/EventHandler"));
const CommandHandler_1 = __importDefault(require("./handlers/CommandHandler"));
const Embed_1 = __importDefault(require("./structures/Embed"));
const eris_1 = __importDefault(require("eris"));
/** QuartzClient Class */
class Client extends eris_1.default.Client {
    constructor(token, options, extensions) {
        if (!token && !process.env.DISCORD_TOKEN)
            throw new TypeError('Discord Token required!');
        super(token || process.env.DISCORD_TOKEN, options.eris);
        if (!options)
            options = { owner: null, eventHandler: null, commandHandler: null };
        this.owner = options.owner;
        this.logger = new LogHandler_1.default();
        this.eventHandler = new EventHandler_1.default(this, options.eventHandler);
        this.commandHandler = new CommandHandler_1.default(this, options.commandHandler);
        this.embed = () => new Embed_1.default();
        this.commandHandler = this.commandHandler;
        this.eventHandler = this.eventHandler;
        this.logger = this.logger;
        this.extensions = extensions || {};
    }
    /**
     * Start the bot
     */
    async start() {
        // Load events using eventHandler
        await this.eventHandler.loadEvents();
        // Load commands using commandHandler
        await this.commandHandler.loadCommands();
        // Bind messageCreate to commandHandler
        this.on('messageCreate', this.commandHandler._onMessageCreate.bind(this.commandHandler));
        // Connect to discord using eris client
        return this.connect().catch((error) => {
            throw new Error(`Unable to start: ${error}`);
        });
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map