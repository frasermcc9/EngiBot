const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { findBestMatch } = require("string-similarity");
const { SpaceClient } = require("spacey-client");

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
     */
    async run(msg) {
        const discordId = msg.author.id;
        const client = await SpaceClient.create(discordId);

        let skins = client.Player.skins;
        if (skins.length == 0)
            return msg.say("You do not have any skins. If you have the tokens, then use the CreateSkin command to create a skin!");

        const skinNames = [...skins.map((s) => s.skinName), "None"];

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
                const content = m.cleanContent;
                const candidate = findBestMatch(content, skinNames).bestMatch.target;

                if (candidate == "None") {
                    await client.action("removeSkin", {});
                    client.destroy();
                    return msg.say("Skin removed!");
                }

                const skin = skins.find((s) => s.skinName == candidate);
                if (skin?.skinName == undefined || skin.skinUri == undefined) {
                    return msg.say("Unknown server error");
                }
                const result = await client.action("equipSkin", skin);
                client.destroy();

                if (result.success) return msg.say(`Your skin ${candidate} has been applied!`);
                else return msg.say(result.msg);
            }
        );
    }
};
