require("dotenv").config();

const path = require("path");
const { readFileSync } = require("fs");

const { chance, delimit } = require("./Util.js");

const Discord = require("discord.js");
const { CommandoClient } = require("discord.js-commando");
const client = new CommandoClient({
    commandPrefix: "%",
    owner: "202917897176219648",
    invite: "https://discord.gg/rwFhQ9V",
    disableMentions: "everyone",
});
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ["core", "Core Commands"],
        ["engineering", "Inside Jokes for the Engineering Server"],
        ["moderation", "Moderation Commands"],
        ["fun", "Random, fun commands"],
        ["stocksim", "Commands for the stock market simulator"],
        ["confessions", "Commands that allow for anonymous confessions"],
        ["spacey", "The SpaceY game"],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({ unknownCommand: false })
    .registerCommandsIn(path.join(__dirname, "commands"));

const stockClient = require("stocksim");
stockClient.Client.CreateClient({
    dbName: "stocksim",
    iexKey: process.env.IEX_TOKEN,
    uri: process.env.DATABASE_PATH,
    newUserValue: 1000,
});
stockClient.connect();

const {
    Setup,
    MaterialGenerator,
    ShipGenerator,
    AttachmentGenerator,
    FactionGenerator,
    NodeGenerator,
    Client,
    AsteroidBuilder,
    PlayerModel,
} = require("space-y");

Setup.begin()
    .setupClient({
        databaseName: "spacey",
        databaseUri: process.env.DATABASE_PATH,
    })
    .addMaterials(MaterialGenerator.apply(null))
    .addShips(ShipGenerator.apply(null))
    .addAttachments(AttachmentGenerator.apply(null))
    .addFactions(FactionGenerator.apply(null))
    .addLocations(NodeGenerator.apply(null))
    .addLink("Gemini", "Kalen")
    .addLink("Kalen", "Lyra")
    .addLink("Lyra", "Aries")
    .addLink("Aries", "Auriga")
    .addLink("Auriga", "Orion")
    .addLink("Orion", "Kalen")
    .finishMap()
    .defaultAsteroidCooldown(300)
    .defaultCredits(10000)
    .defaultLocation("Gemini")
    .defaultShip("Recovered Escape Pod")
    .maxMaterialRarity(10)
    .maxTechLevel(10)
    .finish();

Client.Reg.Spacemap.updateMap();
setInterval(() => {
    Client.Reg.Spacemap.updateMap();
}, 1000 * 60 * 15);

client.once("ready", () => {
    if (client.user == null) return;
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(`In ${client.guilds.cache.size} guilds.`);
});

client.on("error", console.error);

client.login(process.env.DISCORD_TOKEN).then(() => {});

client.on("message", async (msg) => {
    const guildId = msg.guild.id;
    if (chance(0.005) && !msg.author.bot) {
        const ServerList = JSON.parse(readFileSync("./commands/spacey/PublicAsteroid.json", "utf8"));
        if (ServerList[guildId]?.enabled != true) return;

        const m = await msg.react("🌑");
        setTimeout(() => m.remove(), 5 * 1000);

        const filter = (reaction, author) => {
            return reaction.emoji.name == "🌑" && author.bot == false;
        };

        const collector = new Discord.ReactionCollector(msg, filter, { time: 1000 * 5 });
        collector.on("end", async (data) => {
            const num = data.size;
            if (num == 0) return;

            const value = ~~(Math.random() * (num * 1000) + 1000);
            const asteroid = new AsteroidBuilder("PUBLIC").addTag("Public").BuildRandom({ value: value });

            const reactions = data.array();
            const users = reactions[0].users.cache.array().filter((u) => u.bot == false);
            const names = users.map((user) => user.username);

            const output = new Discord.MessageEmbed()
                .setTitle("Asteroid Mining")
                .setDescription(`An asteroid worth ${delimit(value)}¢ was mined!`)
                .addField("Successful Miners", names.join(", "))
                .setColor("#ffee00");
            msg.say(output);

            for (const user of users) {
                const player = await PlayerModel.findOneOrCreate({ uId: user.id });
                await asteroid.mine(player);
            }
        });
    }
});
