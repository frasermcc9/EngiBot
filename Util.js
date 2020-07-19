module.exports = class Util {
	/**
	 *
	 * @param {MessageEmbed} Embed
	 * @param {String} HeaderName
	 * @param {Array} arr
	 */
	static EmbedSplitter(Embed, HeaderName, arr, chunkSize, sep, inline) {
		var i,
			j,
			tempArray,
			chunk = chunkSize || 24,
			whitespace = "⠀",
			sepStr = sep || " ",
			inlineField = inline;

		if (inlineField == undefined) inlineField = true;

		for (i = 0, j = arr.length; i < j; i += chunk) {
			tempArray = arr.slice(i, i + chunk);
			Embed.addField(i == 0 ? HeaderName : whitespace, tempArray.join(sepStr), inlineField);
		}
		while (i % (3 * chunkSize) != 1 && inline) {
			Embed.addField(whitespace, whitespace, true);
			i++;
		}
		return;
	}

	static GenerateHelp(cmd, usage, ...fields) {
		const { MessageEmbed } = require("discord.js");
		let output = new MessageEmbed()
			.setAuthor(`${cmd.category} Commands`)
			.setTitle(`${cmd.aliases.map((e) => Util.CapFirst(e)).join(", ")}`)
			.setDescription(cmd.description)
			.setColor("#7deb34")
			.addField("Usage", usage)
			.addFields(fields)
			.setThumbnail("https://hotemoji.com/images/dl/1/question-mark-emoji-by-twitter.png");
		return output;
	}

	/**
	 *
	 * @param {String} str
	 */
	static CapFirst(str) {
		return str.replace(/^\w/, (c) => c.toUpperCase());
	}

	/**
	 *
	 * @param {String} str
	 * @param {String} markup
	 */
	static Markup(str, markup) {
		return markup + str + markup;
	}

	static CheckParams(...args) {
		for (var i of args) {
			if (i == undefined || i == null) {
				return false;
			}
		}
		return true;
	}

	/**
	 * random between two numbers (min and max inclusive)
	 * @param {number} min
	 * @param {number} max
	 */
	static rb(min, max) {
		// min and max included
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static tab() {
		return "⠀⠀";
	}
	/**
	 * delimits a numeric string
	 * @param {string} txt
	 */
	static delimit(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	/**
	 * generates a boolean based on whether a random number generated is less
	 * than the probability. ie there is an *x* chance true is returned.
	 * @param {Number} x chance to return true (1 always, 0 never)
	 */
	static chance(x) {
		return Math.random() < x;
	}
};
