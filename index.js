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

client.on("error", console.error);

client.login(process.env.DISCORD_TOKEN);

client.once("ready", () => {
    if (client.user == null) return;
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(`In ${client.guilds.cache.size} guilds.`);
});

const stockClient = require("stocksim");
stockClient.Client.CreateClient({
    dbName: "stocksim",
    iexKey: process.env.IEX_TOKEN,
    uri: process.env.DATABASE_PATH,
    newUserValue: 1000,
});
stockClient.connect();
