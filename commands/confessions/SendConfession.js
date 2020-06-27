"use strict";

const { Command, CommandoMessage } = require("discord.js-commando");
const { User, MessageEmbed, TextChannel, MessageCollector } = require("discord.js");

const { writeFile, readFile, readFileSync, fstat, writeFileSync } = require("fs");

module.exports = class SendConfessionCommand extends Command {
	constructor(client) {
		super(client, {
			name: "sendconfession",
			aliases: ["confess", "makeconfession", "submitconfession"],
			memberName: "sendconfession",
			group: "confessions",
			description: "Will toggle whether confessions within the server.",
			guildOnly: false,
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/** @param {CommandoMessage} msg*/
	async run(msg) {
		if (msg.channel.type != "dm") return msg.say("This command is only allowed through direct messages.");
		let ServerData = JSON.parse(readFileSync("./commands/confessions/Data.json", "utf8"));
		//Server Name <-> Server Id
		const Servers = new Map();
		for (const ServerId in ServerData) {
			if (ServerData[ServerId].enabled == false) continue;
			const name = ServerData[ServerId].name;
			Servers.set(name, ServerId);
		}
		const ServerNames = Array.from(Servers.keys());
		const SimplifiedServerNames = ServerNames.map((val) => val.toLowerCase().replace(/\s/g, ""));
		const ServerEmbed = new MessageEmbed()
			.setTitle("Available Servers")
			.setColor("#9003fc")
			.setDescription(ServerNames.join("\n"))
			.addField("Instructions:", "Please reply with a server (you must be in it) to send a message to.");
		msg.say(ServerEmbed);

		/** @param {CommandoMessage} m */
		const filter = (m) => SimplifiedServerNames.includes(m.content.toLowerCase().replace(/\s/g, "")) && m.author.id == msg.author.id;
		new MessageCollector(msg.channel, filter, { time: 15000 })
			.once("end", (data) => {
				if (data.size == 0) return msg.say("Opportunity to submit a server expired.");
			})

			.once("collect", (data) => {
				const message = data.content.toLowerCase().replace(/\s/g, "");
				const index = SimplifiedServerNames.findIndex((val) => val == message);
				const ServerName = ServerNames[index];
				const ServerId = Servers.get(ServerName);
				const ServerRequest = this.client.guilds.cache.find((s) => s.id == ServerId);
				const ConfirmMember = ServerRequest.members.cache.find((m) => m.id == msg.author.id);
				if (ConfirmMember) {
					msg.say("You have 15 minutes to submit.");
					new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 15 * 60 * 1000 })
						.once("end", (data) => {
							if (data.size == 0) return msg.say("Opportunity to submit confession expired.");
						})

						.once("collect", (data) => {
							const ChannelRequest = ServerRequest.channels.cache.find((s) => s.id == ServerData[ServerId].channel);
							if (ChannelRequest.type == "text") {
								handlePost(data, ChannelRequest, msg);
							}
						});
				} else {
					return msg.say(`You do not appear to be a member in this server.`);
				}
			});

		/**
		 * @param {any} data
		 * @param {TextChannel} ChannelRequest
		 */
		function handlePost(data, ChannelRequest) {
			let countData = require("./Count.json");
			let count = Number(countData.num);
			countData.num = count + 1;
			writeFileSync("./commands/confessions/Count.json", JSON.stringify(countData));
			const ConfessEmbed = new MessageEmbed()
				.setTitle(`Confession Number ${countData.num}`)
				.setDescription("Send your anonymous confessions to me through a direct message, using the confess command!")
				.setTimestamp()
				.addField("Confession:", data.content)
				.setColor("RANDOM");
			ChannelRequest.send(ConfessEmbed);
			return msg.say("Confession Posted!");
		}
	}
};
