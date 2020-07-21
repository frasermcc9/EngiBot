const { Command, CommandoMessage, util } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

const Util = require("../../Util.js");
const { SpaceClient } = require("spacey-client");

module.exports = class AttachmentsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "attachments",
            aliases: ["attach", "ship-attachments", "%a", "equipped"],
            memberName: "attachments",
            group: "spacey",
            description: "View your ship's attachments in detail.",
            guildOnly: true,
            clientPermissions: ["SEND_MESSAGES"],
            args: [
                {
                    key: "user",
                    prompt: "The user who's attachments you would like to see",
                    type: "member",
                    default: (m) => m.member,
                },
            ],
        });
    }
    /**
     * @param {CommandoMessage} msg
     * @param {object} param1
     * @param {GuildMember} param1.user
     */
    async run(msg, { user }) {
        const discordId = user.id;
        const client = await SpaceClient.create(discordId);

        const ship = client.Player.ship;
        const attachments = ship.equipped;

        const output = new MessageEmbed()
            .setAuthor(`${user.nickname || user.displayName}'s Attachments`)
            .setTitle(ship.name)
            .setDescription("Your Attachments")
            .setImage(ship.baseShip.imageUri)
            .setColor("#8c34eb");

        attachments.forEach((a) =>
            output.addField(
                `${a.name} - [${a.energyCost.join(" | ")}]`,
                `${a.description}\nTech Level: ${a.techLevel}\nCost: ${a.cost + "¢" ?? "None"}`,
                false
            )
        );

        if (attachments.length == 0) output.addField("None", "You have no attachments equipped.");

        return msg.say(output);
    }
};
