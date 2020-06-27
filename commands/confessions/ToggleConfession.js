"use strict";

const { Command, CommandoMessage, ArgumentType } = require("discord.js-commando");
const { User, MessageEmbed, TextChannel, Message } = require("discord.js");

const { writeFile, readFile, readFileSync, fstat, writeFileSync } = require("fs");

module.exports = class ToggleConfessionCommand extends Command {
	constructor(client) {
		super(client, {
			name: "toggleconfession",
			aliases: ["tconfessions", "tconfession"],
			memberName: "toggleconfession",
			group: "confessions",
			description: "Will toggle whether confessions within the server.",
			guildOnly: true,
			userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "channel",
					prompt: "What channel would you like this servers confessions sent to?",
					type: "channel",
					/** @param {Message} m*/
					default: (m) => m.channel,
				},
			],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {TextChannel} param1.channel
	 */
	async run(msg, { channel }) {
		let ServerData = JSON.parse(readFileSync("./commands/confessions/Data.json", "utf8"));
		let enabledFlag;
		const ServerId = msg.guild.id;
		const ThisServer = ServerData[ServerId];
		if (ThisServer) {
			if (ThisServer.enabled) {
				ThisServer.enabled = false;
				enabledFlag = false;
			} else {
				ThisServer.enabled = true;
				ThisServer.channel = channel.id;
				enabledFlag = true;
			}
		} else {
			const NewServer = {
				id: ServerId,
				name: msg.guild.name,
				enabled: true,
				channel: channel.id,
			};
			ServerData[ServerId] = NewServer;
			enabledFlag = true;
		}
		writeFileSync("./commands/confessions/Data.json", JSON.stringify(ServerData), "utf8");
		return msg.say(`Confessions in this server are now turned ${enabledFlag ? `on! Confessions will be sent to ${channel}.` : "off!"}`);
	}
};
