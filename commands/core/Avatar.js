"use strict";

const { Command, CommandoMessage } = require("discord.js-commando");
const { User, MessageEmbed } = require("discord.js");

module.exports = class AvatarCommand extends Command {
	constructor(client) {
		super(client, {
			name: "avatar",
			aliases: ["profilepicture", "displaypicture", "profile"],
			memberName: "avatar",
			group: "core",
			description: "Will show a full sized image of the given user.",
			guildOnly: true,
			args: [
				{
					type: "user",
					prompt: "Which user would you like to get the avatar of?",
					key: "input",
					default: (msg) => msg.author,
				},
				{
					type: "boolean",
					prompt: "Would you like to get the animated version of this avatar",
					key: "anim",
					default: true,
				},
			],
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {User} param1.input
	 * @param {boolean} param1.anim
	 */
	async run(msg, { input, anim }) {
		return msg.say(
			new MessageEmbed()
				.setTitle(`${input.username}'s profile picture!`)
				.setURL(input.displayAvatarURL({ format: "png", dynamic: anim, size: 4096 }))
				.setImage(input.displayAvatarURL({ format: "png", dynamic: anim, size: 4096 }))
				.setColor("RANDOM")
		);
	}
};
