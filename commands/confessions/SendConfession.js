"use strict";

const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, TextChannel, MessageCollector, Util } = require("discord.js");

const { readFileSync, writeFileSync } = require("fs");

const { findBestMatch } = require("string-similarity");
const { EmbedSplitter } = require("../../Util");

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

		const ServerEmbed = new MessageEmbed()
			.setTitle("Available Servers")
			.setColor("#9003fc")
			.setDescription(ServerNames.join("\n"))
			.addField(
				"Instructions:",
				"Please reply with a server (you must be in it) to send a message to. Whatever you type will be linked to the closest match."
			);
		msg.say(ServerEmbed);

		/** @param {CommandoMessage} m */
		const filter = (m) => m.author.id == msg.author.id;
		new MessageCollector(msg.channel, filter, { time: 15000 })
			.once("end", (data) => {
				if (data.size == 0) return msg.say("Opportunity to submit a server expired.");
			})

			.once("collect", (data) => {
				const ServerName = findBestMatch(data.content, ServerNames).bestMatch.target;
				const ServerId = Servers.get(ServerName);
				const ServerRequest = this.client.guilds.cache.find((s) => s.id == ServerId);
				if (!ServerRequest) return msg.say("An error occurred with this server. Contact its admins.");
				const ConfirmMember = ServerRequest.members.cache.find((m) => m.id == msg.author.id);
				if (ConfirmMember) {
					msg.say(`You have 15 minutes to submit a confession to ${ServerName}`);
					new MessageCollector(msg.channel, (m) => m.author.id == msg.author.id, { time: 15 * 60 * 1000 })
						.once("end", (data) => {
							if (data.size == 0) return msg.say("Opportunity to submit confession expired.");
						})

						.once("collect", (data) => {
							const ChannelRequest = ServerRequest.channels.cache.find(
								(s) => s.id == ServerData[ServerId].channel && s.type == "text"
							);
							if (!ChannelRequest)
								return msg.say(
									"An error occurred with this server. Contact its admins. Its confession channel does not appear to exist."
								);
							ChannelRequest;
							handlePost(data, ChannelRequest);
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
				.setFooter("Send a DM to me saying 'Confess' to make an anonymous confession!")
				.setTimestamp()
				.setColor("RANDOM");

			const StringChunks = data.content.match(/.{1,1023}/g);
			if (StringChunks == null || StringChunks == undefined)
				return msg.say("Some unknown error occurred when trying to send the confession.");
			ConfessEmbed.addField("Confession:", StringChunks.shift());
			StringChunks.forEach((chunk) => {
				ConfessEmbed.addField("⠀", chunk, false);
			});
			ChannelRequest.send(ConfessEmbed);
			return msg.say("Confession Posted!");
		}
	}
};
