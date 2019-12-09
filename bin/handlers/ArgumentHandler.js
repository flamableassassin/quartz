"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArgumentHandler {
    constructor(client, command, args) {
        this.client = client;
        this.command = command;
        this.args = args;
        this.string = args.join(' ');
        this.types = ['user', 'string', 'channel', 'role', 'message', 'integer', 'float'];
    }
    quoted() {
        let quoted = this.string.match(/“(?:\.|(\\\“)|[^\“”\n])*”|(?:[^\s"]+|"[^"]*")/g);
        if (quoted && quoted.length > 0) {
            quoted = quoted.map((q) => {
                if (q.startsWith('"') && q.endsWith('"') || q.startsWith('“') && q.endsWith('”'))
                    return q.slice(1, -1);
                else
                    return q;
            });
        }
        return quoted || undefined;
    }
    prompt(msg, key, prompt) {
        if (typeof prompt === 'string') {
            return msg.embed(prompt);
        }
        else if (typeof prompt === 'function') {
            return prompt(msg);
        }
        else {
            return msg.embed(`No result for ${key} found.`);
        }
    }
    default(arg, msg) {
        if (!arg.default)
            return undefined;
        if (typeof arg.default === 'string') {
            return arg.default;
        }
        else if (typeof arg.default === 'function') {
            return arg.default(msg);
        }
        else {
            return undefined;
        }
    }
    parse(msg) {
        if (this.command.args && this.command.args.length > 0) {
            const parsed = {};
            const args = this.quoted();
            let prompt = false;
            this.command.args.forEach((arg) => {
                if (arg.key && arg.type && this.types.includes(arg.type)) {
                    const CustomType = require(`../types/${arg.type}`).default;
                    const type = new CustomType(this.client);
                    const defaultValue = this.default(arg, msg);
                    console.log(defaultValue);
                    if (!defaultValue && (!args || args.length <= 0 || !args[this.command.args.indexOf(arg)] || this.command.args.indexOf(arg).length <= 0)) {
                        prompt = true;
                        return this.prompt(msg, arg.key, arg.prompt);
                    }
                    if (!args || args.length <= 0) {
                        prompt = true;
                        return this.prompt(msg, arg.key, arg.prompt);
                    }
                    if (this.command.args.slice(-1)[0].key === arg.key) {
                        args.splice(0, this.command.args.length - 1);
                        let result = type.parse(args.join(' ') || '' || defaultValue || '', msg);
                        if (!result) {
                            if (defaultValue)
                                result = defaultValue;
                            else {
                                prompt = true;
                                return this.prompt(msg, arg.key, arg.prompt);
                            }
                        }
                        parsed[arg.key] = result;
                    }
                    else {
                        let result = type.parse(args[this.command.args.indexOf(arg)] || defaultValue || '', msg);
                        if (!result) {
                            if (defaultValue)
                                result = defaultValue;
                            else {
                                prompt = true;
                                return this.prompt(msg, arg.key, arg.prompt);
                            }
                        }
                        parsed[arg.key] = result;
                    }
                }
            });
            if (prompt)
                return undefined;
            return parsed || this.args;
        }
        else {
            return this.args;
        }
    }
}
exports.default = ArgumentHandler;
//# sourceMappingURL=ArgumentHandler.js.map