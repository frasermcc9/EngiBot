"use strict";

const { Command } = require("discord.js-commando");
const { Message } = require("discord.js");

module.exports = class EchoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "echo",
			aliases: ["repeat", "say"],
			memberName: "echo",
			group: "core",
			description: "Will repeat what you say, and delete your message",
			guildOnly: true,
			args: [
				{
					key: "input",
					prompt: "What is the text you would like me to say?",
					type: "string",
					validate: (query) => query.length > 0 && query.length < 1950,
				},
			],
			clientPermissions: ["MANAGE_MESSAGES"],
		});
	}

	/**
	 * @param {Message} msg
	 * @param {object} param1
	 * @param {string} param1.input
	 */
	async run(msg, { input }) {
		if (msg.deletable) {
			msg.delete();
		}
		return msg.say(input);
	}
};
