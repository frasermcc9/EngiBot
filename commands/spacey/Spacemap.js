const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

<<<<<<< HEAD
const { PlayerModel } = require("space-y");
=======
>>>>>>> cd7ac39ba0d714571de4a03b35bb3ac876a7d4dc
const Util = require("../../Util.js");

module.exports = class SpacemapCommand extends Command {
	constructor(client) {
		super(client, {
			name: "spacemap",
			aliases: ["space-map", "map", "%sm"],
			memberName: "spacemap",
			group: "spacey",
			description: "View the spacemap",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		const output = new MessageEmbed()
			.setTitle(`The Galaxy`)
			.setColor("#880af0")
			.setImage(
				"https://media.discordapp.net/attachments/730728698478854275/730728893606264873/draft_map_02.png?width=1093&height=684"
			);
		return msg.say(output);
	}
};
