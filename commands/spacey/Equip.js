const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { PlayerModel, Client } = require("space-y");
const Util = require("../../Util.js");
const { findBestMatch } = require("string-similarity");
const { AttachmentType } = require("space-y/build/lib/GameTypes/GameAsset/Attachment/Attachment");

module.exports = class EquipCommand extends Command {
	constructor(client) {
		super(client, {
			name: "equip",
			aliases: ["eqip", "equp", "equip-attachment", "apply-attachment", "add-attachment", "%eq"],
			memberName: "equip",
			group: "spacey",
			description: "Add an attachment to your ship.",
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

		const attachmentKV = player.availableAttachments();
		if (attachmentKV.size < 1) return msg.say("You don't have any attachments");
		const attachmentNames = attachmentKV.keyArray();
		const attachmentObjs = Client.Reg.ResolveAttachmentsFromName(...attachmentNames);

		const formatString = attachmentObjs.map((a) => `${a.Name} - ${AttachmentType[a.Type]}. You have: ${attachmentKV.get(a.Name)}`);

		const slots = player.availableAttachmentSlots().map((num, type) => {
			return `${AttachmentType[type]} - ${num} slots available.`;
		});

		const output = new MessageEmbed()
			.setAuthor(`Equip Attachment`)
			.setTitle(`Please Select an Attachment:`)
			.setDescription(formatString.join("\n"))
			.addField("Available Slots", slots.join("\n"))
			.setColor("#fc6f03")
			.setThumbnail(msg.author.displayAvatarURL())
			.setFooter("Type 'cancel' to cancel.");
		msg.say(output).then((m) => m.delete({ timeout: 30 * 1000 }));
		new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
			"collect",
			/**@param {Message} m */ async (m) => {
				const content = m.content;

				if (content.toLowerCase() == "cancel") {
					return msg.say("Cancelled");
				}

				const candidate = findBestMatch(content, attachmentNames).bestMatch.target;

				const result = await player.equipAttachment(candidate);
				switch (result.code) {
					case 200:
						return msg.say(`Successfully added **${candidate}** to your ship.`);
					case 404:
						return msg.say("Could not find this attachment.");
					case 403:
						return msg.say("You have no slots available.");
					default:
						return msg.say("Internal server error.");
				}
			}
		);
	}
};
