//generates a random number

const { Command, CommandoMessage } = require("discord.js-commando");
const { rb } = require("../../Util.js");

module.exports = class RateCommand extends Command {
	constructor(client) {
		super(client, {
			name: "rate",
			aliases: ["rateme"],
			memberName: "rate",
			group: "fun",
			description: "Rate something",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "item",
					prompt: "What would you like me to rate?",
					type: "string",
					validate: (query) => query.length > 0 && query.length < 100,
					default: (msg) => msg.member.displayName,
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} msg
	 * @param {object} p
	 * @param {string} p.item
	 */
	async run(msg, { item }) {
		const includeEmote = ":smile:";
		const value = rb(0, 10);

		return msg.say(`:thinking:  |  **I would rate ${item}:** a ${value}/10  ${includeEmote}`);
	}
};
