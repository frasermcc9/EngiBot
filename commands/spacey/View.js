const { Command, CommandoMessage, util } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

const { findBestMatch } = require("string-similarity");

const { SpaceClient, retrieveItem } = require("spacey-client");
const Util = require("../../Util");

module.exports = class ViewItemCommand extends Command {
    constructor(client) {
        super(client, {
            name: "view",
            aliases: ["viewitem", "view-item", "iteminfo", "%v"],
            memberName: "view",
            group: "spacey",
            description: "Find information about an item",
            guildOnly: true,
            clientPermissions: ["SEND_MESSAGES"],
            args: [
                {
                    key: "item",
                    prompt: "What item would you like to see?",
                    type: "string",
                },
            ],
        });
    }
    /**
     * @param {CommandoMessage} msg
     * @param {object} param1
     * @param {string} param1.item
     */
    async run(msg, { item }) {
        const discordId = msg.author.id;
        const client = await SpaceClient.create(discordId);
        const availablePool = await Promise.all([
            ...(await client.findAll("materials")).keys(),
            ...(await client.findAll("ships")).keys(),
            ...(await client.findAll("attachments")).keys(),
            ...(await client.findAll("factions")).keys(),
        ]);

        const matcher = findBestMatch(item, availablePool);
        const searchKey = matcher.bestMatch.target;
        const nextBestTargets = matcher.ratings
            .sort((a, b) => b.rating - a.rating)
            .slice(1, 4)
            .map((r) => r.target);

        const result = (await retrieveItem(searchKey)).item;

        let type = "";
        if (Object.prototype.hasOwnProperty.call(result, "subclass")) type = "Ship";
        else if (Object.prototype.hasOwnProperty.call(result, "mineable")) type = "Material";
        else if (Object.prototype.hasOwnProperty.call(result, "energyCost")) type = "Attachment";
        else if (Object.prototype.hasOwnProperty.call(result, "usedShips")) type = "Faction";

        const bp = await client.findBlueprint(result.name);
        let bpOne = "No Blueprint";
        let bpTwo = "No Blueprint";
        let bpThree = "No Blueprint";

        if (bp.result) {
            const full = bp.blueprint.map((val, key) => `${val}x ${key}`);
            bpOne = full.slice(0, full.length / 3).join("\n");
            bpTwo = full.slice(full.length / 3, (2 * full.length) / 3).join("\n");
            bpThree = full.slice((2 * full.length) / 3).join("\n");
        }
        const playerOwnsBlueprint = client.Player.hasBlueprint(searchKey);

        const output = new MessageEmbed()
            .setTitle(result.name)
            .setDescription(result.description)
            .addField("Cost", Util.delimit(result.cost ?? "0") + "¢", true)
            .addField("Tech Level", result.techLevel, true)
            .addField("Type", type, true)
            .addField("Blueprint Data", bpOne, true)
            .addField("Blueprint Data", bpTwo, true)
            .addField("Blueprint Data", bpThree, true)
            .addField("Blueprint Ownership", `You ${playerOwnsBlueprint ? "do" : "do not"} own this blueprint.`)
            .setFooter(`Other close matches: ${nextBestTargets.join(", ")}`)
            .setColor("#4429cc");
        return msg.say(output);
    }
};
