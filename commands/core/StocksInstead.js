"use strict";

const { Command, CommandoMessage } = require("discord.js-commando");
const { User, MessageEmbed } = require("discord.js");
const Util = require("../../Util.js");

module.exports = class StocksInsteadCommand extends Command {
	constructor(client) {
		super(client, {
			name: "stocksinstead",
			aliases: ["ifiinvest"],
			memberName: "stocksinstead",
			group: "core",
			description: "Will tell you how much some amount of money would become if you put it in stocks instead.",
			guildOnly: true,
			args: [
				{
					type: "float",
					prompt: "How much money would you put in stocks instead?",
					key: "amount",
				},
				{
					type: "float",
					prompt: "How much extra would you like to put in each year?",
					key: "added",
					default: 0,
				},
				{
					type: "integer",
					prompt: "Over how many years?",
					key: "duration",
					default: 40,
				},
				{
					type: "boolean",
					prompt: "Should the amount you add increase based on inflation?",
					key: "addIncrease",
					default: false,
				},
			],
			clientPermissions: ["SEND_MESSAGES"],
		});
	}

	/**
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {number} param1.amount
	 * @param {number} param1.added
	 * @param {number} param1.duration
	 */
	async run(msg, { amount, added, duration, addIncrease }) {
		let etfAmount = amount;
		let savingsAmount = amount;
		let noInterestAmount = amount;

		const addedStart = Util.delimit(added.toFixed(2));

		for (let i = 0; i < duration; i++) {
			etfAmount *= 1.07;
			etfAmount += added;

			savingsAmount += added;
            savingsAmount *= 1.015;
            savingsAmount *= 0.98

			noInterestAmount += added;
			noInterestAmount *= 0.98;

			if (addIncrease) added *= 1.02;
		}

		const amountFinal = Util.delimit(amount.toFixed(2));
		const addedFinal = Util.delimit(added.toFixed(2));
		const inputFinal = Util.delimit((added * duration + amount).toFixed(2));

		const etfFinal = Util.delimit(etfAmount.toFixed(2));
		const savingsFinal = Util.delimit(savingsAmount.toFixed(2));
		const noInterestFinal = Util.delimit(noInterestAmount.toFixed(2));

		const output = new MessageEmbed()
			.setTitle("If I Invest?")
			.setColor("#C3E88D")
			.setDescription(`You invested $${amountFinal} initially, and added $${addedStart} - $${addedFinal} each year, for ${duration} years, for a total of $${inputFinal}.`)
			.addField(`In an ETF that tracks the S&P500:`, `You would end up with about $${etfFinal}.`)
			.addField(`In a savings account:`, `You would end up with about $${savingsFinal}.`)
			.addField(`In a no-interest account:`, `You would end up with about $${noInterestFinal}.`)
			.setFooter(
				"Usage: [prefix]StocksInstead [initial] [added] [years] [increase add for inflation].\nAssumptions: Inflation rate is 2%. S&P average return is 7% including inflation. Savings account interest rate is 1.5%."
			);

		return msg.say(output);
	}
};
