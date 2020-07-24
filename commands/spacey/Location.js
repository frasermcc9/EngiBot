const { Command, CommandoMessage } = require("discord.js-commando");
const { MessageEmbed, Message, GuildMember } = require("discord.js");

<<<<<<< HEAD
const { PlayerModel } = require("space-y");
const Util = require("../../Util.js");

module.exports = class LocationCommand extends Command {
	constructor(client) {
		super(client, {
			name: "location",
			aliases: ["spacelocation", "space-location", "%l"],
			memberName: "location",
			group: "spacey",
			description: "View your current location in the galaxy in SpaceY.",
			guildOnly: true,
			clientPermissions: ["SEND_MESSAGES"],
			args: [
				{
					key: "user",
					prompt: "The user who's location you would like to see",
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
		const location = player.Location;

		let stores = location.storeDisplayNames().join("\n");
		if (stores.length == 0) stores = "*No Stores*";
		let asteroids = location.asteroidDisplayNames().join("\n");
		if (asteroids.length == 0) asteroids = "*No Asteroids*";

		const output = new MessageEmbed()
			.setAuthor(`${user.nickname || user.displayName}'s Location in the Galaxy`)
			.setTitle(`**${Util.delimit(location.Name)}** System`)
			.setDescription(`*The ${location.Faction.Name} Alliance*`)
			.addField("Stores", stores, true)
			.addField("Asteroids", asteroids, true)
			.setColor("#24c718")
            .setThumbnail(player.Location.Faction.Uri)
            .setImage(location.ImageUri)
		return msg.say(output);
	}
=======
const Util = require("../../Util.js");
const { SpaceClient } = require("spacey-client");

module.exports = class LocationCommand extends Command {
    constructor(client) {
        super(client, {
            name: "location",
            aliases: ["spacelocation", "space-location", "%l"],
            memberName: "location",
            group: "spacey",
            description: "View your current location in the galaxy in SpaceY.",
            guildOnly: true,
            clientPermissions: ["SEND_MESSAGES"],
            args: [
                {
                    key: "user",
                    prompt: "The user who's location you would like to see",
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
        const client = await SpaceClient.create(discordId);
        const location = (await client.Player.currentLocation()).location;

        let stores = location.stores.join("\n");
        if (stores.length == 0) stores = "*No Stores*";
        let asteroids = location.asteroids.map((a) => `${a.name}: ~${a.value}¢`).join("\n");
        if (asteroids.length == 0) asteroids = "*No Asteroids*";

        const output = new MessageEmbed()
            .setAuthor(`${user.nickname || user.displayName}'s Location in the Galaxy`)
            .setTitle(`**${Util.delimit(location.name)}** System`)
            .setDescription(`*The ${location.faction.name} Alliance*`)
            .addField("Stores", stores, true)
            .addField("Asteroids", asteroids, true)
            .setColor("#24c718")
            .setThumbnail(location.faction.imageUri)
            .setImage(location.imageUri);
        return msg.say(output);
    }
>>>>>>> cd7ac39ba0d714571de4a03b35bb3ac876a7d4dc
};
