const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

<<<<<<< HEAD
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
=======
const { findBestMatch } = require("string-similarity");
const { SpaceClient, constants } = require("spacey-client");

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
     */
    async run(msg) {
        const discordId = msg.author.id;
        const client = await SpaceClient.create(discordId);
        const attachmentObjs = await client.findAll("attachments");

        const m = await msg.say("Getting attachments...");

        setTimeout(() => m.delete(), 1000 * 30);

        let attachmentKV = new Map();
        let attachmentNames;
        let formatString;
        let slots;

        function updateMessage() {
            attachmentKV = client.Player.inventory.attachments;
            attachmentKV.forEach((val, key) => {
                if (val < 1) attachmentKV.delete(key);
            });
            if (attachmentKV.size < 1) {
                MC.stop();
                return msg.say("You have no more attachments to equip.");
            }

            attachmentNames = Array.from(attachmentKV.keys());

            formatString = attachmentNames.map((name) => {
                if (attachmentKV.get(name) > 0)
                    return `${name} - Type: ${
                        constants.AttachmentType[attachmentObjs.get(name)?.type] ?? "0"
                    }. You have: ${attachmentKV.get(name)}`;
            });

            slots = new Array();
            client.Player.availableSlots().forEach((num, type) =>
                slots.push(`${constants.AttachmentType[type]} - ${num} slots available.`)
            );

            const output = new MessageEmbed()
                .setAuthor(`Equip Attachment`)
                .setTitle(`Please Select an Attachment:`)
                .setDescription(formatString.join("\n"))
                .addField("Available Slots", slots.join("\n"))
                .setColor("#fc6f03")
                .setThumbnail(msg.author.displayAvatarURL())
                .setFooter("Type 'cancel' to cancel.");
            m.edit(output);
        }

        const MC = new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 })
            .on(
                "collect",
                /**@param {Message} m */ async (m) => {
                    const content = m.cleanContent;
                    attachmentNames.push("Cancel");

                    const candidate = findBestMatch(content, attachmentNames).bestMatch.target;
                    if (candidate == "Cancel") {
                        client.destroy();
                        return msg.say("Cancelled");
                    }

                    const result = await client.action("equip", { attachment: candidate });
                    m.delete();
                    msg.say(result.msg);
                    await client.update(result.playerStringified);
                    updateMessage();
                }
            )
            .once("end", () => client.destroy());

        updateMessage();
    }
>>>>>>> cd7ac39ba0d714571de4a03b35bb3ac876a7d4dc
};
