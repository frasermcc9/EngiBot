const { Command, CommandoMessage } = require("discord.js-commando");
const { GuildMember, ReactionCollector } = require("discord.js");
const { writeFile } = require("fs");

module.exports = class MarryCommand extends Command {
	constructor(client) {
		super(client, {
			name: "marry",
			aliases: ["propose"],
			memberName: "marry",
			group: "engineering",
			description: "Propose to someone in the server",
			guildOnly: true,
			args: [
				{
					type: "member",
					prompt: "Who would you like to marry",
					key: "member",
				},
			],
		});
	}
	/**
	 *
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {GuildMember} param1.member
	 */
	async run(msg, { member }) {
		let MarriageRegister = require("./marry.json");
		const askerId = msg.author.id;
		const receiverId = member.id;

		if (MarriageRegister[askerId]) {
			return msg.say("You are already married.");
        }
        if (MarriageRegister[receiverId]){
            return msg.say("This person is already married.")
        }
		const query = await msg.say(`${member}, would you like to marry ${msg.member.displayName}`);
		await Promise.all([query.react("✅"), query.react("❌")]);

		const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id == receiverId;

		new ReactionCollector(query, filter, { time: 30000 })
			.once("collect", async (collected) => {
				switch (collected.emoji.name) {
					case "✅":
						MarriageRegister[askerId] = receiverId;
						MarriageRegister[receiverId] = askerId;
						writeFile("./commands/engineering/marry.json", JSON.stringify(MarriageRegister), (err) => {
							console.log(err);
						});
						return msg.say(`💒 👰🤵 ${msg.member.displayName} and ${member.displayName} have been married!`);
					case "❌":
						return msg.say(`You have rejected ${msg.member.displayName}`);
				}
			})
			.once("end", async () => {
				query.delete();
			});
	}
};
