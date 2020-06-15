const { Command } = require("discord.js-commando");

module.exports = class PotatoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "potato",
			aliases: ["potatopotato"],
			memberName: "potato",
			group: "engineering",
			description: "Potatoes",
			guildOnly: true,
		});
	}

	async run(msg) {
		return msg.say(`Potato potato potato potato potato.`);
	}
};
