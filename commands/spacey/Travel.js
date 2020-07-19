const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");
const { findBestMatch } = require("string-similarity");

module.exports = class TravelCommand extends Command {
	constructor(client) {
		super(client, {
			name: "travel",
			aliases: ["space-warp", "space-travel", "warp", "%t"],
			memberName: "travel",
			group: "spacey",
			description: "Warp to a location",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		const discordId = msg.author.id;
		const player = await PlayerModel.findOneOrCreate({ uId: discordId });

		const locations = player.adjacentLocations();
		const locationNames = locations.map((location) => location.Name);

		const output = new MessageEmbed()
			.setAuthor(`Space Travel`)
			.setTitle(`Please select an adjacent location:`)
			.setFooter(`Current location: ${player.Location.Name}`)
			.addField(`System`, locations.map((L) => `${L.Name}: `).join("\n"), true)
			.addField(
				"Warp Required",
				locations.map((L) => `${L.RequiredWarp} warp power required`),
				true
			)
			.setColor("#f5b642")
			.setThumbnail(msg.author.displayAvatarURL())
			.setImage(player.Location.ImageUri);
		msg.say(output);
		new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
			"collect",
			/**@param {Message} m */ async (m) => {
				const content = m.content;
				const candidate = findBestMatch(content, locationNames).bestMatch.target;
				const result = await player.travelTo(candidate);
				if (result) {
					return msg.say(`Successfully travelled to ${candidate}`);
				} else {
					return msg.say(
						`Cannot travel to ${candidate}. Your warp drive is insufficient, or you do not have enough energy cells.`
					);
				}
			}
		);
	}
};
