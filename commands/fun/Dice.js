const { Command, CommandoMessage } = require("discord.js-commando");
const { rb } = require("../../Util.js");

module.exports = class DiceCommand extends Command {
	constructor(client) {
		super(client, {
			name: "dice",
			aliases: ["rolldice", "rolldie"],
			memberName: "dice",
			group: "fun",
			description: "Roll a die",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		const value = rb(1, 6);
		return msg.say(`:game_die: |  **You rolled a:** a ${value}`);
	}
};
