const Kuromoji = require("kuromoji");



class Generator {
	constructor () {
		/** @type {Object<string, Kuromoji.IpadicFeatures[]>} */
		this.wordSet = {};
		/** @type {Object<string, Kuromoji.IpadicFeatures[]>} */
		this.wordSetByStructure = {};
		/** @type {String[][]} */
		this.structureSet = [];
	}

	/**
	 * データの登録を行います
	 * @param {Kuromoji.IpadicFeatures[]} tokenized
	 */
	register (tokenized) {
		const { wordSet, wordSetByStructure, structureSet } = this;

		tokenized.forEach((word, index, parent) => {
			const nowWord = word;
			const nowStructure = nowWord.pos;
			const prevForm = parent[index - 1] ? parent[index - 1].surface_form : "";

			if (!nowWord) return;

			if (!wordSet[prevForm]) wordSet[prevForm] = [];
			if (!wordSetByStructure[nowStructure]) wordSetByStructure[nowStructure] = [];

			wordSet[prevForm].push(nowWord);
			wordSetByStructure[nowStructure].push(nowWord);
		});

		structureSet.push(tokenized.map(word => word.pos));



		/*tokenized.forEach((wordInfo, index, parent) => {
			const nowWord = wordInfo;
			const nowStructure = `${nowWord.pos}|${nowWord.pos_detail_1}|${nowWord.pos_detail_2}|${nowWord.pos_detail_3}`;
			const prevForm = parent[index - 1] ? parent[index - 1].surface_form : "";

			if (!nowWord) return;

			if (!this.wordSet[prevForm]) this.wordSet[prevForm] = [];
			if (!this.structureSet[nowStructure]) this.structureSet[nowStructure] = [];

			this.wordSet[prevForm].push(nowWord);
			this.structureSet[nowStructure].push(nowWord);
		});*/
	}

	/**
	 * 次に続く文字を返します
	 * 
	 * @param {String} word
	 * @return {Kuromoji.IpadicFeatures}
	 */
	next (word = "") {
		const { wordSet, wordSetByStructure } = this;

		if (!wordSet[word]) return;

		const words = wordSet[word];
		const structures = words.map(word => word.pos);
		const currentStructure = structures[Math.floor(Math.random() * structures.length)];

		if (!word) {
			const matchedWords = wordSetByStructure[currentStructure];
			return matchedWords[Math.floor(Math.random() * matchedWords.length)];
		}
		
		const matchedWords = words.filter(word => word.pos === currentStructure);
		return matchedWords[Math.floor(Math.random() * matchedWords.length)];



		/*const formatPos = word => `${word.pos}|${word.pos_detail_1}|${word.pos_detail_2}|${word.pos_detail_3}`;
		const words = this.wordSet[word];

		if (!words) return;

		const structures = words.map(word => formatPos(word));
		const currentStructure = structures[Math.floor(Math.random() * structures.length)];

		if (!word) {
			const matchedWords = this.structureSet[currentStructure];
			return matchedWords[Math.floor(Math.random() * matchedWords.length)];
		}

		const matchedWords = words.filter(word => formatPos(word) === currentStructure);
		return matchedWords[Math.floor(Math.random() * matchedWords.length)];*/
	}

	/**
	 * 文章を合成します
	 * 
	 * @param {String} word
	 * @return {String}
	 */
	generate (word = "") {
		const content = [ word ];
		let next;

		while ((next = this.next(word))) {
			content.push(next.surface_form);
			word = next.surface_form;
		}

		return content.join("");
	}
}

module.exports = Generator;