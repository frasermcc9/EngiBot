const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Role } = require("discord.js");
const Util = require("../../Util.js");

module.exports = class UsersInCommand extends Command {
	constructor(client) {
		super(client, {
			name: "in",
			aliases: ["membersin", "usersin", "inrole", "inrank"],
			memberName: "in",
			group: "core",
			description: "See all people in a role",
			guildOnly: true,
			args: [
				{
					type: "role",
					prompt: "What role would you like to see the people in?",
					key: "roleName",
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} msg
	 * @param {object} a
	 * @param {Role} a.role
	 */
	async run(msg, { role }) {
		if (msg.guild.roles.cache.find((r) => r == role) == null) {
			return msg.channel.send("No one has that role, or you mistyped it.");
		}

		let memberWithRole = msg.guild.roles.cache.find((r) => r == role).members.array();
		let size = memberWithRole.length;

		let output = new MessageEmbed().setColor(role.color).setTitle(`Users in ${role.name}`);
		output.setDescription(size);
		Util.EmbedSplitter(output, "List", memberWithRole, 30, "\n");

		return msg.say(output);
	}
};
