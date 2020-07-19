const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");
const { findBestMatch } = require("string-similarity");

module.exports = class ChangeSkinCommand extends Command {
	constructor(client) {
		super(client, {
			name: "changeskin",
			aliases: ["change-skin", "switch-skin", "%cs", "swap-skin", "remove-skin", "rem-skin", "remskin", "removeskin", "swapskin"],
			memberName: "changeskin",
			group: "spacey",
			description: "Switch to a different skin",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {GuildMember} param1.user
	 */
	async run(msg) {
		const discordId = msg.author.id;
		const player = await PlayerModel.findOneOrCreate({ uId: discordId });

		let skins = player.availableSkins;
		if (skins.length == 0) return msg.say("You do not have any skins");

		let skinNames = skins.map((s) => s.SkinName);

		const output = new MessageEmbed()
			.setAuthor(`Space Travel`)
			.setTitle(`Please Select a Skin:`)
			.setDescription(skinNames.join("\n"))
			.setColor("#fc6f03")
			.setThumbnail(msg.author.displayAvatarURL())
			.setFooter("Type 'none' to remove your skin.");
		msg.say(output);
		new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
			"collect",
			/**@param {Message} m */ async (m) => {
				const content = m.content;

				if (content.toLowerCase() == "none") {
					await player.removeSkin();
					return msg.say("Skin removed!");
				}

				const candidate = findBestMatch(content, skinNames).bestMatch.target;
				const skin = skins.find((s) => s.SkinName == candidate);
				if (skin?.SkinName == undefined || skin.SkinUri == undefined) {
					return msg.say("Unknown server error");
				}
				player.applySkin(skin?.SkinName, skin?.SkinUri);
				return msg.say(`Your skin ${candidate} has been applied!`);
			}
		);
	}
};
