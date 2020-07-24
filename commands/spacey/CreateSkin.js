const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");
const { SpaceClient } = require("spacey-client");

module.exports = class CreateSkinCommand extends Command {
    constructor(client) {
        super(client, {
            name: "createskin",
            aliases: ["create-skin", "new-skin", "%csk"],
            memberName: "createskin",
            group: "spacey",
            description: "Add a new skin",
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
        const player = client.Player;

        const tokens = player.inventory.tokens;

        if (tokens <= 0) return msg.say("You have no tokens for skins.");

        msg.channel.send("Please reply with the name you would like to call your skin").then((m) => m.delete({ timeout: 30 * 1000 }));

        new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 45 * 1000 }).once(
            "collect",
            /**@param {Message} m */ async (m) => {
                const name = m.content;

                msg.channel.send("Please reply a URL for the image this skin uses").then((m) => m.delete({ timeout: 30 * 1000 }));

                new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
                    "collect",
                    /**@param {Message} m */ async (m) => {
                        const uri = m.content;

                        const result = await client.action("createSkin", { skinName: name, uri: uri });
                        client.destroy();
                        if (result.success) {
                            return msg.say("Your new skin has been applied!");
                        } else {
                            return msg.say("An error prevented you from creating this skin.");
                        }
                    }
                );
            }
        );
    }
};
