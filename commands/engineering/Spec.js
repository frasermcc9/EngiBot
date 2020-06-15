const { Command, CommandoMessage } = require("discord.js-commando");

module.exports = class SpecCommand extends Command {
	constructor(client) {
		super(client, {
			name: "spec",
			aliases: ["whatspec", "gpatospec", "specialisation", "specialization"],
			memberName: "spec",
			group: "engineering",
			description: "Tells you what spec you should do",
			guildOnly: true,
			args: [
				{
					key: "gpa",
					prompt: "What is your GPA?",
					type: "integer",
				},
			],
		});
	}

	/**
	 *
	 * @param {CommandoMessage} msg
	 * @param {object} param1
	 * @param {number} param1.gpa
	 */
	async run(msg, { gpa }) {
		let spec;

		const n = new Map()
			.set(0, "Electrical Engineering")
			.set(1, "Chemical and Materials Engineering")
			.set(2, "Civil Engineering")
			.set(3, "Mechanical Engineering")
			.set(4, "Computer Systems Engineering")
			.set(5, "Biomedical Engineering")
			.set(6, "Mechatronics Engineering")
			.set(7, "Engineering Science")
			.set(8, "Software Engineering");

		switch (gpa) {
			case 1:
				spec = BuildProbabilityValues(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8]);
				break;
			case 2:
				spec = BuildProbabilityValues(n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8]);
				break;
			case 3:
				spec = BuildProbabilityValues(n[2], n[3], n[0], n[1], n[4], n[5], n[6], n[7], n[8]);
				break;
			case 4:
				spec = BuildProbabilityValues(n[3], n[2], n[1], n[4], n[0], n[5], n[6], n[7], n[8]);
				break;
			case 5:
				spec = BuildProbabilityValues(n[6], n[3], n[5], n[4], n[2], n[1], n[0], n[7], n[8]);
				break;
			case 6:
				spec = BuildProbabilityValues(n[6], n[5], n[7], n[3], n[2], n[4], n[1], n[0], n[8]);
				break;
			case 7:
				spec = BuildProbabilityValues(n[7], n[6], n[8], n[5], n[4], n[3], n[2], n[1], n[0]);
				break;
			case 8:
				spec = BuildProbabilityValues(n[8], n[7], n[6], n[5], n[3], n[4], n[2], n[1], n[0]);
				break;
			case 9:
				spec = BuildProbabilityValues(n[8], n[7], n[6], n[5], n[4], n[3], n[2], n[1], n[0]);
				break;
			default:
				spec = "You are too dumb to continue with engineering";
		}

		return msg.say(`You should do **${spec}!**`);
	}
};

function BuildProbabilityValues(val0, val1, val2, val3, val4, val5, val6, val7, val8) {
	var val = 0;
	for (var i = 5; i > 0; i--) {
		val += Math.random();
	}
	val = val / 5 - 0.5;
	if (val < 0) {
		val = Math.abs(val);
	}
	if (val > 0 && val <= 0.0555) {
		return val0;
	}
	if (val > 0.0555 && val <= 0.1111) {
		return val1;
	}
	if (val > 0.1111 && val <= 0.1667) {
		return val2;
	}
	if (val > 0.1667 && val <= 0.222222) {
		return val3;
	}
	if (val > 0.222222 && val <= 0.277778) {
		return val4;
	}
	if (val > 0.277778 && val <= 0.33333) {
		return val5;
	}
	if (val > 0.33333 && val <= 0.3888889) {
		return val6;
	}
	if (val > 0.3888889 && val <= 0.44444) {
		return val7;
	} else {
		return val8;
	}
}
