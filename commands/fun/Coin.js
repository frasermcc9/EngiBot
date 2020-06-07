const { Command, CommandoMessage } = require("discord.js-commando");
const { rb } = require("../../Util.js");

module.exports = class CoinCommand extends Command {
	constructor(client) {
		super(client, {
			name: "coin",
			aliases: ["flipacoin", "coinflip"],
			memberName: "coin",
			group: "fun",
			description: "Flip a coin",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		var value = rb(0, 1);
		switch (value) {
			case 0:
				return msg.say(`:moneybag: | You flipped a coin and got **Heads**`);
			case 1:
				return msg.say(`:moneybag: | You flipped a coin and got **Tails**`);
		}
	}
};
