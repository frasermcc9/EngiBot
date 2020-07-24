const { Command, CommandoMessage } = require("discord.js-commando");

const { readFileSync, writeFileSync } = require("fs");

module.exports = class ToggleAsteroidCommand extends Command {
	constructor(client) {
		super(client, {
			name: "toggleasteroid",
			aliases: ["publicasteroid", "%tga", "%toggle-asteroid", "%toggle-public-asteroid"],
			memberName: "toggleasteroid",
			group: "spacey",
			description: "Will toggle whether public asteroids are enabled in the server.",
			guildOnly: true,
			//userPermissions: ["ADMINISTRATOR"],
			clientPermissions: ["SEND_MESSAGES"],
		});
	}
	/**
	 * @param {CommandoMessage} msg
	 */
	async run(msg) {
		let ServerData = JSON.parse(readFileSync("./commands/spacey/PublicAsteroid.json", "utf8"));
		let enabledFlag;
		const ServerId = msg.guild.id;
		const ThisServer = ServerData[ServerId];
		if (ThisServer) {
			if (ThisServer.enabled) {
				ThisServer.enabled = false;
				enabledFlag = false;
			} else {
				ThisServer.enabled = true;
				enabledFlag = true;
			}
		} else {
			const NewServer = {
				id: ServerId,
				name: msg.guild.name,
				enabled: true,
			};
			ServerData[ServerId] = NewServer;
			enabledFlag = true;
		}
		writeFileSync("./commands/spacey/PublicAsteroid.json", JSON.stringify(ServerData), "utf8");
		return msg.say(`Public asteroids in this server are now turned ${enabledFlag ? `on!` : "off!"}`);
	}
};
