const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector, Base } = require("discord.js");

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

        let sMsg = await msg.say("Getting Map");
        const m = Array.isArray(sMsg) ? sMsg[0] : sMsg;

        let current;
        let adjacents = [];
        let adjacentNames = [];

        async function updateMessage() {
            current = await client.Player.currentLocation().catch((e) => {
                throw new Error(e);
            });
            adjacents = current.adjacent.map((n) => `${n.name}: ${n.requiredWarp} warp power required.`);
            adjacentNames = current.adjacent.map((m) => m.name);

            const output = new MessageEmbed()
                .setAuthor(`Space Travel`)
                .setTitle(`Please select an adjacent location:`)
                .setDescription("Type cancel to stop. You can keep entering destinations to keep travelling.")
                .setFooter(`Current location: ${client.Player.location}`)
                .addField(`System`, adjacents.join("\n"), true)
                .setColor("#f5b642")
                .setThumbnail(msg.author.displayAvatarURL())
                .setImage(current.imageUri);
            m.edit(output);
        }

        await updateMessage();

        let replyMessage;

        const collector = new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 })
            .on(
                "collect",
                /**@param {Message} collectedM */ async (collectedM) => {
                    if (collectedM.deletable) collectedM.delete();

                    const content = collectedM.content;
                    if (!/^[A-Za-z]/.test(content)) {
                        return collector.stop();
                    }

                    adjacentNames.push("cancel");
                    const best = findBestMatch(content, adjacentNames).bestMatch;
                    if (best.rating < 0.2) {
                        return msg.say("Unknown location.").then((m) => m.delete({ timeout: 1000 }));
                    }
                    const candidate = best.target;

                    if (candidate == "cancel") {
                        collector.stop();
                        await m.delete();
                        return msg.say("Warping Finished.");
                    }

                    const result = await client.action("warp", { locationName: candidate });

                    if (result.success) {
                        await client.update(result.playerStringified);
                        await updateMessage();
                        return;
                    } else {
                        if (replyMessage) await replyMessage.delete();
                        replyMessage = msg.say(
                            `Cannot travel to ${candidate}. Your warp drive is insufficient, or you do not have enough energy cells.`
                        );
                        return;
                    }
                }
            )
            .once("end", () => {
                client.destroy();
                if (m.deletable) m.delete();
            });
    }
};
