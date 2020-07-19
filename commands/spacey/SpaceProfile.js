const { Command, CommandoMessage, util } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");

module.exports = class SpaceProfileCommand extends Command {
	constructor(client) {
		super(client, {
			name: "spaceprofile",
			aliases: ["spacey", "sprofile", "space-profile", "%p"],
			memberName: "spaceprofile",
			group: "spacey",
			description: "View your SpaceY profile",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "user",
					prompt: "The user who's profile you would like to see",
					type: "member",
					default: (m) => m.member,
				},
			],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {GuildMember} param1.user
	 */
	async run(msg, { user }) {
		const discordId = user.id;
		const player = await PlayerModel.findOneOrCreate({ uId: discordId });

		const data = player.profile();
		const shipStats = data.ship.ShipStatistics;

		const output = new MessageEmbed()
			.setAuthor(`Level ${data.level} - ${data.expToNext} xp to level ${data.level + 1}`)
			.setTitle(`${user.nickname || user.displayName}'s SpaceY Profile`)
			.setDescription(`Skill Points:\nWeapons: ${data.skills[0]}\nEngineering: ${data.skills[1]}\nTechnology: ${data.skills[2]}`)
			.setThumbnail(data.bestFaction?.Uri || "")
			.addField("Credits", Util.delimit(data.credits) + "¢", true)
			.addField("Location", data.location.Name, true)
			.addField("Best Faction", data.bestFaction?.Name, true)
            .addField("Strength Rating", data.ship.Strength, true)
			.setImage(data.image)
			.setColor("#24c718");
		return msg.say(output);
	}
};
