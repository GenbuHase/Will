const Kuromoji = require("kuromoji");



/**
 * @class Generator
 */
class Generator {
	constructor () {
		/** @type {Dictionary} */
		this.dictionary = new Dictionary();
		/** @type {Object<string, Kuromoji.IpadicFeatures[]>} */
		this.wordSet = {};
		/** @type {String[][]} */
		this.structureSet = [];
	}

	/**
	 * データの登録を行います
	 * @param {Kuromoji.IpadicFeatures[]} tokenized
	 */
	register (tokenized) {
		const { dictionary, wordSet, structureSet } = this;

		Array.prototype.push.apply(dictionary, tokenized);
		structureSet.push(tokenized.map(word => word.pos));

		tokenized.forEach((word, index, parent) => {
			const nowWord = word;
			const prevForm = parent[index - 1] ? parent[index - 1].surface_form : "";

			if (!nowWord) return;

			if (!wordSet[prevForm]) wordSet[prevForm] = [];
			wordSet[prevForm].push(nowWord);
		});



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
	 * @param {String} [word=""]
	 * @param {String | null} [structure=null]
	 * 
	 * @return {Kuromoji.IpadicFeatures}
	 */
	next (word = "", structure = null) {
		const { dictionary, wordSet } = this;

		if (!wordSet[word]) return;

		const words = wordSet[word];
		const structures = words.map(word => word.pos);
		const currentStructure = structures[Math.floor(Math.random() * structures.length)];

		if (!word) {
			const matchedWords = dictionary.orderByStructure(structure || currentStructure);
			return matchedWords[Math.floor(Math.random() * matchedWords.length)];
		}
		
		const matchedWords = words.filter(word => word.pos === (structure || currentStructure));
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
	 * @param {String} [word=""]
	 * @param {Boolean} [isAdvanced=false]
	 * 
	 * @return {String}
	 */
	generate (word = "", isAdvanced = false) {
		const { structureSet } = this;
		
		const content = [ word ];
		const structures = structureSet[Math.floor(Math.random() * structureSet.length)];

		let next = word;
		let counter = 0;
		while ((next = this.next(next, (!word && isAdvanced) ? structures[counter] : null))) {
			next = next.surface_form;
			counter++;

			content.push(next);
		}

		return content.join("");
	}
}

/**
 * @class Dictionary @extends Array
 */
class Dictionary extends Array {
	constructor () {
		super();
	}

	/**
	 * 指定された品詞の単語を返します
	 * 
	 * @param {String} type
	 * @return {Kuromoji.IpadicFeatures[]}
	 */
	orderByStructure (type) {
		if (!type) throw new StructureError(type);

		return this.filter(word => word.pos === type);
	}
}

/**
 * @class StructureError @extends TypeError
 */
class StructureError extends TypeError {
	/**
	 * 品詞に関するエラーを生成します
	 * @param {String} type
	 */
	constructor (type) {
		super(`A structure type, "${type}" is not acceptable`);
	}
}



module.exports = Generator;