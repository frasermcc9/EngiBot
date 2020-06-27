//generates a random number

const { Command, CommandoMessage } = require("discord.js-commando");

module.exports = class PurgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "purge",
			aliases: ["prune", "bulkdelete", "deletemessages"],
			memberName: "purge",
			group: "moderation",
			description: "Bulk delete messages in this channel.",
			guildOnly: true,
			userPermissions: ["MANAGE_MESSAGES"],
			clientPermissions: ["MANAGE_MESSAGES"],
			args: [
				{
					key: "numberOfMessages",
					prompt: "How many messages should be deleted?",
					type: "integer",
				},
			],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 * @param {Object} param1
	 * @param {number} param1.numberOfMessages
	 */
	async run(msg, { numberOfMessages }) {
		msg.channel
			.bulkDelete(numberOfMessages + 1)
			.then(async (m) => {
				const AlertMessage = await msg.say(`${m.size} messages deleted successfully.`);
				return AlertMessage.delete({ timeout: 5000 });
			})
			.catch((err) => {
				console.warn(err);
				return msg.say("I cannot perform that action.");
			});
	}
};
