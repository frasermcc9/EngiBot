const { Command } = require("discord.js-commando");

module.exports = class AcademicIntegrityCommand extends Command {
	constructor(client) {
		super(client, {
			name: "academicintegrity",
			aliases: ["academic", "academicintegrity", "integrity", "acint"],
			memberName: "academicintegrity",
			group: "engineering",
			description: "Detect any academic dishonesty",
			guildOnly: true,
		});
	}

	async run(msg) {
		var val = Math.floor(Math.random() * 500);
		var text;
		if (val <= 50) {
			text = "minimal academic dishonesty detected, taking no action";
		}
		if (val > 50 && val <= 150) {
			text = "some academic dishonesty detected, deploying underpaid tutors to investigate";
		}
		if (val > 150 && val <= 250) {
			text = "large amounts of academic cheating detected, deploying Peter Bier";
		}
		if (val > 250 && val <= 350) {
			text = "substantial cheating detected, deploying the vice chancellor";
		}
		if (val > 350 && val <= 450) {
			text = "substantial cheating detected in all locations. This is an extreme threat to education. Shutting off the internet";
		}
		if (val > 450) {
			text = "maximum, widespread cheating. Alerting Jacinda";
		}
		return msg.say(`Academic Dishonesty level is at ${val}, ${text}.`);
	}
};
