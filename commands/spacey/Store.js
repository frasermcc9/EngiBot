const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, GuildMember, MessageCollector, Message } = require("discord.js");

const Util = require("../../Util.js");
const { findBestMatch } = require("string-similarity");
const { SpaceClient } = require("spacey-client");
const { MapCollection } = require("spacey-client/build/extensions/MapCollection");

module.exports = class StoreCommand extends Command {
    constructor(client) {
        super(client, {
            name: "store",
            aliases: ["spaceport", "weapons-emporium", "shipyard", "sp", "sy", "we", "%s"],
            memberName: "store",
            group: "spacey",
            description: "Visit the stores in your region",
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

        const storeNames = location.stores;
        if (storeNames.length == 0) {
            return msg.say("There aren't any stores in this system.");
        }

        storeNames.push("Cancel");

        const output = new MessageEmbed()
            .setTitle(`Store in this system`)
            .setDescription(storeNames.join("\n"))
            .setColor("#0367fc")
            .setThumbnail(location.faction.imageUri)
            .setFooter("Reply with the store you would like to visit");
        const storesMsg = await msg.say(output);

        new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
            "collect",
            /**@param {Message} m */ async (m) => {
                const content = m.content;
                const candidate = findBestMatch(content, storeNames).bestMatch.target;

                if (candidate == "Cancel") {
                    return msg.say("Cancelled store buying") && storesMsg.delete();
                }

                const store = storeNames.find((s) => s == candidate);
                if (store == undefined) {
                    return msg.say("There are no stores matching that input.");
                }

                //Creates client-side store
                const storeConnection = await client.createStoreConnection(store);
                const storeData = storeConnection.storeStock();
                const costs = storeData.costs;

                //The base message that can be updated
                let preEditMessage = await msg.say("Getting Items...");
                const BaseMessage = Array.isArray(preEditMessage) ? preEditMessage[0] : preEditMessage;

                let purchaseable = updateDisplay(BaseMessage, client.Player, storeData, location.faction.imageUri);
                if (purchaseable.size == 0) return;

                /** @param {Message} m */
                const filter = (m) => {
                    return m.author.id == msg.author.id && (/^[+\-!]\d+ \S/.test(m.content) || /store/.test(m.content));
                };

                const validRequests = purchaseable.keyArray();
                validRequests.push("Cancel");
                const purchaseHandler = new MessageCollector(msg.channel, filter, {
                    time: 60 * 1000,
                })
                    .on(
                        "collect",
                        /**@param {Message} m */ async (m) => {
                            //Deny multiple stores open at once for a single user
                            if (m.content.match(/store/)) {
                                return purchaseHandler.stop();
                            }

                            const firstSpace = m.content.indexOf(" ");

                            const mode = m.content[0];
                            const quantity = Number(m.content.slice(1, firstSpace));
                            const identifier = m.content.slice(firstSpace + 1);

                            const candidate = findBestMatch(identifier, validRequests).bestMatch.target;

                            if (candidate == "Cancel") purchaseHandler.stop();

                            let result;
                            if (mode == "+") {
                                result = await storeConnection.buy(candidate, quantity);
                                if (result.success) {
                                    updateDisplay(BaseMessage, client.Player, storeData, location.faction.imageUri);
                                    return msg.say(`Bought ${quantity} ${candidate} for ${(costs.get(candidate) ?? 0) * quantity}¢`);
                                }
                            } else if (mode == "-") {
                                result = await storeConnection.sell(candidate, quantity);
                                if (result.success) {
                                    updateDisplay(BaseMessage, client.Player, storeData, location.faction.imageUri);
                                    return msg.say(`Sold ${quantity} ${candidate} for ${(costs.get(candidate) ?? 0) * quantity}¢`);
                                }
                            } else if (mode == "!") {
                                result = await storeConnection.forceSell(candidate, quantity);
                                if (result.success) {
                                    updateDisplay(BaseMessage, client.Player, storeData, location.faction.imageUri);
                                    let paid = (costs.get(candidate) ?? 0) * quantity;
                                    paid = paid > storeData.credits ? storeData.credits : paid;
                                    return msg.say(`Sold ${quantity} ${candidate} for ${paid}¢`);
                                }
                            }
                            switch (result.msg) {
                                case "400":
                                    return msg.say("Input appears to be malformed");
                                case "404":
                                    return msg.say("The requested item was not found");
                                case "405":
                                    return msg.say("The item is not buyable");
                                case "403":
                                    return msg.say(
                                        "Check both you and the store have sufficient credits and resources for this. Use '!' to force-sell (sell even if the store can't pay you fully)."
                                    );
                                default:
                                    return msg.say("Internal server error");
                            }
                        }
                    )
                    .once("end", () => {
                        if (BaseMessage.deletable) BaseMessage.delete();
                        return msg.say("Store trading finished.");
                    });
            }
        );
    }
};
/**
 * @param {Message} m
 * @param {import("spacey-client/build/structures/Player").ClientPlayer} player
 * @param {import("spacey-client/build/structures/Store").StoreData} store
 * @param {string} locationUri
 */
function updateDisplay(m, player, store, locationUri) {
    const device = m.author.presence.clientStatus;

    const stock = store.inventory;
    const costs = store.costs;
    const purchasable = stock.filter((val, name) => val != 0 || player.amountInInventory(name) != 0);

    if (device && device.mobile) {
        const format = purchasable.map((quantity, name) => {
            const playerAmount = player.amountInInventory(name);
            return `${name} - Stock: ${quantity}. You have: ${playerAmount} ${Util.tab()}Cost: $${costs.get(name)}`;
        });
        if (format.length < 1) {
            m.channel.send("No items in stock, or items to sell.");
        }
        m.edit(
            new MessageEmbed()
                .setTitle(store.identity)
                .setDescription(format.join("\n"))
                .addField("Credits", `You: ${player.inventory.credits}¢\nStore: ${store.credits}¢`)
                .addField("Your Cargo", player.inventory.cargoString, true)
                .setColor("#fc0356")
                .setFooter(`To trade: Buy: +[number] [item], Sell: -[number] [item], Force Sell: ![number] [item]`)
                .setThumbnail(locationUri)
        );
    } else {
        const desktopNames = [],
            desktopQuantities = [],
            desktopCosts = [];
        purchasable.forEach((quantity, name) => {
            desktopNames.push(`${name}`);
            desktopQuantities.push(`${quantity} / ${player.amountInInventory(name)}`);
            desktopCosts.push(`Cost: ${costs.get(name)}¢`);
        });
        if (desktopQuantities.length < 1) {
            m.channel.send("No items in stock, or items to sell.");
        }
        m.edit(
            new MessageEmbed()
                .setTitle(store.identity)
                .setDescription("The stores current items are below:")
                .addField("Name", desktopNames.join("\n"), true)
                .addField("Stock / Owned", desktopQuantities.join("\n"), true)
                .addField("Price", desktopCosts.join("\n"), true)
                .addField("Your Credits", `${player.inventory.credits}¢`, true)
                .addField("Shop Credits", `${store.credits}¢`, true)
                .addField("Your Cargo", player.inventory.cargoString, true)
                .setColor("#fc0356")
                .setFooter(`To trade: Buy: +[number] [item], Sell: -[number] [item], Force Sell: ![number] [item]`)
                .setThumbnail(locationUri)
        );
    }

    return purchasable;
}
