const Discord = require("discord.js");
const auth = require("./auth.json");
const path = require("path");

const { CommandoClient } = require("discord.js-commando");
const client = new CommandoClient({
	commandPrefix: "%",
	owner: "202917897176219648",
	invite: "https://discord.gg/rwFhQ9V",
	disableEveryone: true,
	unknownCommandResponse: false,
});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["core", "Core Commands"],
		["engineering", "Inside Jokes for the Engineering Server"],
		["moderation", "Moderation Commands"],
		["fun", "Random, fun commands"],
		["stocksim", "Commands for the stock market simulator"],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, "commands"));

const stockClient = require("stocksim");
stockClient.Client.CreateClient({
	dbName: "stocksim",
	iexKey: auth.iexToken,
	uri: auth.dbUri,
	newUserValue: 1000,
});
stockClient.connect();

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	client.user.setActivity(`In ${client.guilds.cache.size} guilds.`);
});

client.on("error", console.error);

client.login(auth.discordToken).then(() => {});
