const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

const { Fetch } = require("spacey-client");
const Util = require("../../Util.js");

module.exports = class CreditsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "credits",
            aliases: ["credit", "spacecredit", "cred", "%c"],
            memberName: "credits",
            group: "spacey",
            description: "View your current number of credits in SpaceY.",
            guildOnly: true,
            clientPermissions: ["SEND_MESSAGES"],
            args: [
                {
                    key: "user",
                    prompt: "The user who's credits you would like to see",
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
        const client = await Fetch(discordId);

        const output = new MessageEmbed()
            .setTitle(`${user.nickname || user.displayName}'s Credits`)
            .setDescription(`${Util.delimit(client.Player.inventory.credits)}¢`)
            .setColor("#24c718")
            .setThumbnail(user.user.displayAvatarURL());
        return msg.say(output);
    }
};
