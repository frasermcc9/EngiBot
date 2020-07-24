const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { findBestMatch } = require("string-similarity");
const { SpaceClient } = require("spacey-client");

module.exports = class MineCommand extends Command {
    constructor(client) {
        super(client, {
            name: "mine",
            aliases: ["mine-asteroid", "asteroid-mine", "asteroids", "%m"],
            memberName: "mine",
            group: "spacey",
            description: "Mine an asteroid in your region",
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
        const location = await client.Player.currentLocation().catch((e) => {
            throw new Error(e);
        });

        let m = await msg.say("Getting Asteroids...");
        setTimeout(() => {
            m.delete();
        }, 30 * 1000);
        let availableNames = [];
        let unavailableNames = [];

        const updateMessage = async () => {
            const asteroids = (await client.Player.regionAsteroids()).asteroids;

            availableNames = asteroids.available;
            unavailableNames = asteroids.unavailable;

            const asteroidOutput = availableNames.slice();
            asteroidOutput.push(...unavailableNames.map((a) => `${a.name} (unavailable for ${a.cooldown} seconds)`));

            if (availableNames.length == 0) {
                MC.stop();
            }

            const joined = asteroidOutput.length == 0 ? "*No Asteroids*" : asteroidOutput.join("\n");

            const output = new MessageEmbed()
                .setTitle(`Asteroids in this system`)
                .setDescription(joined)
                .setColor("#24c718")
                .setThumbnail(location.imageUri)
                .setFooter("Reply with the asteroid you would like to mine");
            m.edit(output);
        };

        const MC = new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 })
            .on(
                "collect",
                /**@param {Message} m */ async (m) => {
                    const content = m.content;
                    const candidate = findBestMatch(content, availableNames).bestMatch.target;

                    const result = await client.action("mine", { asteroidName: candidate });

                    if (result.success) {
                        await updateMessage();
                        return msg.say(result.msg);
                    } else {
                        return msg.say(result.msg);
                    }
                }
            )
            .once("end", () => client.destroy());

        await updateMessage();
    }
};
