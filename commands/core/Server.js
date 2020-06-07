const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Role } = require("discord.js");
const Util = require("../../Util.js");

module.exports = class ServerCommand extends Command {
	constructor(client) {
		super(client, {
			name: "server",
			aliases: ["guild", "serverinfo", "sinfo", "serverstats"],
			memberName: "server",
			group: "core",
			description: "View information about this server.",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 * @param {object} a
	 * @param {boolean} a.advanced
	 */
	async run(msg, { emote, emotes, role, roles }) {
		let date = msg.guild.joinedAt;
		var numToMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		let year = date.getFullYear();
		let month = numToMonth[date.getMonth()];
		let day = date.getDate();

		let createDate = msg.guild.createdAt;
		let cYear = createDate.getFullYear();
		let cMonth = numToMonth[date.getMonth()];
		let cDay = createDate.getDate();

		let output = new MessageEmbed()
			.setColor("#7deb34")
			.setTitle(msg.guild.name)
			.setDescription(msg.guild.description || "This server has no description.")
			.setThumbnail(msg.guild.iconURL())
			.addField("Number of Boosts", msg.guild.premiumSubscriptionCount)
			.addField("Server Region", msg.guild.region)
			.addField("Member Count", msg.guild.memberCount)
			.addField("Server ID", msg.guild.id)
			.addField("Server Owner", msg.guild.owner)
			.addField("Server Creation Date", `${cDay}/${cMonth}/${cYear}`)
			.addField("When I Joined", `${day}/${month}/${year}`);

		msg.say(output);
	}
};
