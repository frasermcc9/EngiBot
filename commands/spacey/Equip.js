const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

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
};
