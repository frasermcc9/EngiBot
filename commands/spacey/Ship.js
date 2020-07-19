const { Command, CommandoMessage, util } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");
const { SellableDecorator } = require("space-y/build/lib/GameTypes/GameAsset/AssetDecorators");

module.exports = class ShipCommand extends Command {
	constructor(client) {
		super(client, {
			name: "ship",
			aliases: ["spaceship", "%ss"],
			memberName: "ship",
			group: "spacey",
			description: "View your ship profile",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "user",
					prompt: "The user who's profile you would like to see",
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
		const player = await PlayerModel.findOneOrCreate({ uId: discordId });

		const data = player.profile();
		//Base ship statistics
		const bss = data.ship.BaseStatistics;
		//Ship attachments considering attachments and skill points
		const nss = data.ship.Statistics;
		//Difference between nss and bss
		const diff = {
			hp: nss.hp - bss.baseHp,
			shield: nss.shield - bss.baseShield,
			handling: nss.handling - bss.baseHandling,
			cargo: nss.cargo - bss.baseCargo,
			energy: nss.energy.map((v, idx) => v - bss.baseEnergy[idx]),
		};

		const output = new MessageEmbed()
			.setTitle(`${user.nickname || user.displayName}'s Ship`)
			.addField(data.ship.Name, data.ship.Description)
			.addField("Cost", new SellableDecorator(data.ship.Name).PriceData.cost + "¢", true)
			.addField("Tech Capacity", `${data.ship.getTotalTech()}/${data.ship.MaxTech}`, true)
			.addField("Info", "Use the attachments command for more info on your attachments.")
			.addField("Attachments", data.ship.stringifyAttachments().join("\n") + "\n-", true)
			.addField(
				"Ship Stats",
				`Hull Points: ${bss.baseHp} (+${diff.hp})\nShield: ${bss.baseShield} (+${diff.shield})\nWeapon Energy: ${bss.baseEnergy[0]} (+${diff.energy[0]})\nEngine Energy: ${bss.baseEnergy[1]} (+${diff.energy[1]})\nComputer Energy: ${bss.baseEnergy[2]} (+${diff.energy[2]})\nCargo: ${bss.baseCargo} (+${diff.cargo})\nHandling: ${bss.baseHandling} (+${diff.handling})`,
				true
			)
			.setImage(data.ship.Uri)
			.setColor("#8c34eb");
		return msg.say(output);
	}
};
