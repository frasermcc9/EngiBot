"use strict";

const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

module.exports = class SourceCommand extends Command {
	constructor(client) {
		super(client, {
			name: "source",
			aliases: ["sourcecode", "github", "code"],
			memberName: "source",
			group: "core",
			description: "Sends a link to the GitHub repository of this bot.",
			guildOnly: false,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		const Output = new MessageEmbed().setTitle("Source Code").setColor("#9003fc").setURL("https://github.com/frasermcc9/EngiBot").setFooter("Pull requests are welcomed :)");
		return msg.say(Output);
	}
};
