const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember, MessageCollector } = require("discord.js");

const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");
const { findBestMatch } = require("string-similarity");

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
		const device = msg.author.presence.clientStatus;

		const discordId = msg.author.id;
		const player = await PlayerModel.findOneOrCreate({ uId: discordId });
		const location = player.Location;

		const storeNames = location.storeDisplayNames();
		const storesJoin = location.storeDisplayNames().join("\n");
		if (storesJoin.length == 0) {
			return msg.say("There aren't any stores in this system.");
		}

		const output = new MessageEmbed()
			.setTitle(`Store in this system`)
			.setDescription(storesJoin)
			.setColor("#0367fc")
			.setThumbnail(player.Location.Faction.Uri)
			.setFooter("Reply with the store you would like to visit");
		msg.say(output);

		new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 30 * 1000 }).once(
			"collect",
			/**@param {Message} m */ async (m) => {
				const content = m.content;
				const candidate = findBestMatch(content, storeNames).bestMatch.target;

				const store = location.nodeAllStores().find((s) => s.identity() == candidate);
				if (store == undefined) {
					return msg.say("There are no stores matching that input.");
				}

				//Gets map of items that either store or player has >0 of
				let allPurchasable = store.getStoreItems(true);
				let purchasable = allPurchasable.filter((val, name) => val != 0 || player.AutoInventoryRetrieve(name).amount != 0);
				//Map of all items and their costs
				const costs = store.StoreItemCosts;

				//Output based on whether user is mobile or desktop
				let preEditMessage = await msg.say("Getting Items...");
				setTimeout(() => {
					preEditMessage.delete();
				}, 60 * 1000);

				const BaseMessage = Array.isArray(preEditMessage) ? preEditMessage[0] : preEditMessage;
				displayItems();
				function displayItems() {
					const allPurchasable = store.getStoreItems(true);
					const purchasable = allPurchasable.filter((val, name) => val != 0 || player.AutoInventoryRetrieve(name).amount != 0);

					if (device && device.mobile) {
						const format = purchasable.map((quantity, name) => {
							return `${name} - Stock: ${quantity}. You have: ${
								player.AutoInventoryRetrieve(name).amount
							} ${Util.tab()}Cost: $${costs.get(name)}`;
						});
						if (format.size < 1) {
							return msg.say("No items in stock, or items to sell.");
						}
						BaseMessage.edit(
							new MessageEmbed()
								.setTitle(store.identity())
								.setDescription(format.join("\n"))
								.addField("Credits", `You: ${player.Credits}¢\nStore: ${store.Credits}¢`)
								.addField("Your Cargo", player.cargoString(), true)
								.setColor("#fc0356")
								.setFooter(`To trade: Buy: +[number] [item], Sell: -[number] [item], Force Sell: ![number] [item]`)
								.setThumbnail(player.Location.Faction.Uri)
						);
					} else {
						const desktopNames = [],
							desktopQuantities = [],
							desktopCosts = [];
						purchasable.forEach((quantity, name) => {
							desktopNames.push(`${name}`);
							desktopQuantities.push(`${quantity} / ${player.AutoInventoryRetrieve(name).amount}`);
							desktopCosts.push(`Cost: ${costs.get(name)}¢`);
						});
						if (desktopQuantities.length < 1) {
							return msg.say("No items in stock, or items to sell.");
						}
						BaseMessage.edit(
							new MessageEmbed()
								.setTitle(store.identity())
								.setDescription("The stores current items are below:")
								.addField("Name", desktopNames.join("\n"), true)
								.addField("Stock / Owned", desktopQuantities.join("\n"), true)
								.addField("Price", desktopCosts.join("\n"), true)
								.addField("Your Credits", `${player.Credits}¢`, true)
								.addField("Shop Credits", `${store.Credits}¢`, true)
								.addField("Your Cargo", player.cargoString(), true)
								.setColor("#fc0356")
								.setFooter(`To trade: Buy: +[number] [item], Sell: -[number] [item], Force Sell: ![number] [item]`)
								.setThumbnail(player.Location.Faction.Uri)
						).then((m) => m.delete({ timeout: 60 * 1000 }));
					}
				}

				/** @param {Message} m */
				const filter = (m) => {
					return m.author.id == msg.author.id && (/^[+\-!]\d+ \S/.test(m.content) || /store/.test(m.content));
				};

				const validRequests = purchasable.keyArray();
				const purchaseHandler = new MessageCollector(msg.channel, filter, {
					time: 60 * 1000,
				}).on(
					"collect",
					/**@param {Message} m */ async (m) => {
						//Deny multiple stores open at once for a single user
						if (m.content.match(/store/)) purchaseHandler.stop();

						const firstSpace = m.content.indexOf(" ");

						const mode = m.content[0];
						const quantity = Number(m.content.slice(1, firstSpace));
						const identifier = m.content.slice(firstSpace + 1);

						const candidate = findBestMatch(identifier, validRequests).bestMatch.target;

						let result;
						if (mode == "+") {
							result = await store.buyFromStore({ trader: player, item: candidate, quantity: quantity });
							if (result.code == 200) {
								displayItems();
								return msg.say(`Bought ${quantity} ${candidate} for ${(store.getCostPerItem(candidate) ?? 0) * quantity}¢`);
							}
						} else if (mode == "-") {
							result = await store.sellToStore({ trader: player, item: candidate, quantity: quantity });
							if (result.code == 200) {
								displayItems();
								return msg.say(`Sold ${quantity} ${candidate} for ${(store.getCostPerItem(candidate) ?? 0) * quantity}¢`);
							}
						} else if (mode == "!") {
							result = await store.sellToStoreForce({ trader: player, item: candidate, quantity: quantity });
							if (result.code == 200) {
								displayItems();
								return msg.say(`Sold ${quantity} ${candidate} for ${(store.getCostPerItem(candidate) ?? 0) * quantity}¢`);
							}
						}
						if (result == undefined) return;
						switch (result.code) {
							case 400:
								return msg.say("Input appears to be malformed");
							case 404:
								return msg.say("The requested item was not found");
							case 405:
								return msg.say("The item is not buyable");
							case 403:
								return msg.say(
									"Check both you and the store have sufficient credits and resources for this. Use '!' to force-sell (sell even if the store can't pay you fully)."
								);
							default:
								return msg.say("Internal server error");
						}
					}
				);
			}
		);
	}
};
