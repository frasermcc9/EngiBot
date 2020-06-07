const { Command, CommandoMessage } = require("discord.js-commando");
const { GuildMember } = require("discord.js");

module.exports = class KickCommand extends Command {
	constructor(client) {
		super(client, {
			name: "kick",
			aliases: ["destroy", "execute"],
			memberName: "kick",
			group: "moderation",
			description: "Kick someone from the server",
			guildOnly: true,
			userPermissions: ["KICK_MEMBERS"],
			clientPermissions: ["KICK_MEMBERS"],
			args: [
				{
					key: "user",
					prompt: "Who should be deleted immediately?",
					type: "member",
				},
				{
					key: "reason",
					prompt: "Who should be deleted immediately?",
					type: "member",
					default: "",
				},
			],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {GuildMember} param1.user
	 * @param {string} param1.reason
	 */
	async run(msg, { user, reason }) {
		if (user.kickable) {
			user.kick(reason).then(() => msg.channel.send(`${user} was kicked.`));
		} else {
			return msg.say("I am not able to kick this person.");
		}
		return;
	}
};
