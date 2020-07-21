const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { findBestMatch } = require("string-similarity");

const { SpaceClient } = require("spacey-client");

module.exports = class WarpCommand extends Command {
    constructor(client) {
        super(client, {
            name: "warp",
            aliases: ["space-warp", "space-travel", "travel", "%t"],
            memberName: "warp",
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
        const client = await SpaceClient.create(discordId);

        const current = (await client.Player.currentLocation()).location;
        
        const adjacents = current.adjacent.map((n) => `${n.name}: ${n.requiredWarp} warp power required.`);
        const adjacentNames = current.adjacent.map((m) => m.name);

        const output = new MessageEmbed()
            .setAuthor(`Space Travel`)
            .setTitle(`Please select an adjacent location:`)
            .setFooter(`Current location: ${client.Player.location}`)
            .addField(`System`, adjacents.join("\n"), true)
            .setColor("#f5b642")
            .setThumbnail(msg.author.displayAvatarURL())
            .setImage(current.imageUri);
        msg.say(output);
        new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
            "collect",
            /**@param {Message} m */ async (m) => {
                const content = m.content;
                const candidate = findBestMatch(content, adjacentNames).bestMatch.target;
                const result = await client.action("warp", candidate);

                client.close();

                if (result.success) {
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
