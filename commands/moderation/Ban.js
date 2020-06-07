const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

module.exports = class BanCommand extends Command {
	constructor(client) {
		super(client, {
			name: "ban",
			aliases: ["decimate", "executeforever", "guillotine"],
			memberName: "ban",
			group: "moderation",
			description: "Ban someone",
			guildOnly: true,
			userPermissions: ["BAN_MEMBERS"],
			clientPermissions: ["BAN_MEMBERS"],
			args: [
				{
					key: "user",
					prompt: "Who should be deleted for a very, very long time?",
					type: "member",
				},
				{
					key: "reason",
					prompt: "Who should be deleted for a very, very long time?",
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
		if (user.bannable) {
			user.ban(reason).then(() => msg.channel.send(`${user} was removed for a very, very long time.`));
		} else {
			return msg.say("I am not able to ban this person.");
		}
		return;
	}
};
