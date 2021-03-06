const Kuromoji = require("kuromoji");



/*
 * 名詞2つ以上連続
 * (名詞/接尾があればそこで区切る)
 * 
 * 北園高校は東京都板橋区にあります。
 * > 北園 + 高校
 * > 東京 + 都(接尾)
 * > 板橋 + 区(接尾)
 */



/**
 * 学習データを基にして文章合成を行うクラス
 * @author Genbu Hase
 */
class Generator {
	/**
	 * Generatorを生成します
	 * @param {Array<Kuromoji.IpadicFeatures[]>} dbData 取り込む形態素解析データ
	 */
	constructor (dbData) {
		/**
		 * 形態素解析データを基に生成された辞書
		 * @type {Dictionary}
		 */
		this.dictionary = new Dictionary();

		if (dbData) this.importDatabase(dbData);
	}

	/**
	 * 形態素解析データを取り込みます
	 * @param {Array<Kuromoji.IpadicFeatures[]>} dbData 取り込む形態素解析データ
	 */
	importDatabase (dbData) {
		for (const tokenized of dbData) this.dictionary.register(tokenized);
	}

	/**
	 * 文章を生成します
	 * 
	 * @param {String} [vocabulary=""] 開始する単語
	 * @param {Kuromoji.IpadicFeatures[]} [structure=[]] 文章の文法構造
	 * 
	 * @return {String} 生成された文章
	 */
	generate (vocabulary = "", structure = []) {
		const { vocabularies, structures, connections } = this.dictionary;

		const structureBase = structure.length ? structure : structures.pickUp();
		
		let sentence = "";
		structureBase.forEach((token, index) => {
			const { pos, pos_detail_1, pos_detail_2, pos_detail_3, conjugated_type, conjugated_form } = token;

			const vocabDic = new VocabularyDictionary();
			if (0 < index) vocabDic.register(connections.get(structureBase[index - 1]));

			let result = "";
			switch (true) {
				default:
					result = token.surface_form;
					break;

				case pos === "名詞" && pos_detail_1 === "代名詞":
					result = vocabularies.orderBy(vocab => {
						return (
							vocab.pos === pos &&
							
							(
								vocab.pos_detail_1 === pos_detail_1 ||
								(vocab.pos_detail_1 === "固有名詞" && vocab.pos_detail_2 === "人名")
							)
						);
					}).pickUp().surface_form;
					
					break;

				case pos === "名詞" && !["数", "接尾"].includes(pos_detail_1):
				//case pos === "動詞":
					if (vocabDic.orderBy({ pos, pos_detail_1, pos_detail_2, pos_detail_3, conjugated_type, conjugated_form }).length) {
						result = vocabDic.orderBy({ pos, pos_detail_1, pos_detail_2, pos_detail_3, conjugated_type, conjugated_form }).pickUp().surface_form;
					} else {
						result = vocabularies.orderBy({ pos, pos_detail_1, pos_detail_2, pos_detail_3, conjugated_type, conjugated_form }).pickUp().surface_form;
					}

					break;
			}

			sentence += result;
		});

		return sentence;
	}
}



/**
 * 学習データの辞書
 * @author Genbu Hase
 */
class Dictionary {
	/** Dictionaryを生成します */
	constructor () {
		/**
		 * 語彙辞書
		 * @type {VocabularyDictionary}
		 */
		this.vocabularies = new VocabularyDictionary();

		/**
		 * 文法構造辞書
		 * @type {StructureDictionary}
		 */
		this.structures = new StructureDictionary();

		/**
		 * 語彙間連結辞書
		 * @type {ConnectionDictionary}
		 */
		this.connections = new ConnectionDictionary();
	}

	/**
	 * 解析結果を登録します
	 * @param {Kuromoji.IpadicFeatures[]} tokenized 文章の形態素解析結果
	 */
	register (tokenized) {
		this.vocabularies.register(tokenized);
		this.structures.register(tokenized);
		this.connections.register(tokenized);
	}
}



/**
 * 語彙データの辞書
 * 
 * @extends Array<Kuromoji.IpadicFeatures>
 * @author Genbu Hase
 */
class VocabularyDictionary extends Array {
	constructor () { super() }

	/**
	 * 語彙データを登録します
	 * @param {Kuromoji.IpadicFeatures[]} tokenized 文章の形態素解析結果
	 */
	register (tokenized) { this.push(...tokenized) }

	/**
	 * 語彙データをランダムで抽出します
	 * @return {Kuromoji.IpadicFeatures}
	 */
	pickUp () { return this[Math.floor(Math.random() * this.length)] }

	/**
	 * 指定された条件が満たされる語彙で構成された辞書を返します
	 * 
	 * @param {Kuromoji.IpadicFeatures | VocabularyDictionary.OrderByCallback} conditionsOrCallback 満たされる条件 | 条件判別式
	 * @return {VocabularyDictionary} 構成された辞書
	 */
	orderBy (conditionsOrCallback = {}) {
		return this.filter(vocab => {
			if (typeof conditionsOrCallback === "function") return conditionsOrCallback(vocab);
			
			for (const prop in conditionsOrCallback) {
				if (vocab[prop] !== conditionsOrCallback[prop]) return false;
			}

			return true;
		});
	}
}

/**
 * それぞれの語彙に対し、条件を満たすかどうか確認する関数
 * 
 * @callback VocabularyDictionary.OrderByCallback
 * @param {Kuromoji.IpadicFeatures} vocabulary 語彙
 */



/**
 * 文法構造データの辞書
 * 
 * @extends Array<Array<Kuromoji.IpadicFeatures>>
 * @author Genbu Hase
 */
class StructureDictionary extends Array {
	constructor () { super() }

	/**
	 * 文法構造データを登録します
	 * @param {Kuromoji.IpadicFeatures[]} tokenized 文章の形態素解析結果
	 */
	register (tokenized) { this.push(tokenized) }

	/**
	 * 文法構造データをランダムで抽出します
	 * @return {Kuromoji.IpadicFeatures[]}
	 */
	pickUp () { return this[Math.floor(Math.random() * this.length)] }
}



/**
 * 語彙間連結データの辞書
 * @author Genbu Hase
 */
class ConnectionDictionary {
	constructor () {
		/** @type {Object<string, Array<Kuromoji.IpadicFeatures[]>>} */
		this.connections = {};
	}

	/**
	 * 指定された語彙の語彙間連結データを初期化します
	 * @param {ConnectionDictionary.Vocabulary} vocabulary 関連付いた語彙
	 */
	init (vocabulary = "") {
		if (typeof vocabulary === "string") return this.connections[vocabulary] = [];
		return this.connections[vocabulary.surface_form] = [];
	}

	/**
	 * 指定された語彙に関連付けられた語彙を返します
	 * 
	 * @param {ConnectionDictionary.Vocabulary} [vocabulary=""] 関連付いた語彙
	 * @return {Kuromoji.IpadicFeatures[] | null}
	 */
	get (vocabulary = "") {
		if (typeof vocabulary === "string") return this.connections[vocabulary] || null;
		return this.connections[vocabulary.surface_form] || null;
	}

	/**
	 * 指定された語彙に関連付けられた語彙が存在するかどうか返します
	 * 
	 * @param {ConnectionDictionary.Vocabulary} [vocabulary=""] 関連付いた語彙
	 * @return {Boolean}
	 */
	isAvailable (vocabulary = "") { return (this.get(vocabulary) && this.get(vocabulary).length) || false }

	/**
	 * 語彙間連結データを登録します
	 * @param {Kuromoji.IpadicFeatures[]} tokenized 文章の形態素解析結果
	 */
	register (tokenized) {
		if (!tokenized.length) return;

		tokenized.reduce((prev, now) => {
			if (!this.get(prev)) this.init(prev);
			this.get(prev).push(now);

			return now;
		});
	}

	/**
	 * 指定された語彙に関連付けられた語彙をランダムで抽出します
	 * 
	 * @param {ConnectionDictionary.Vocabulary} [vocabulary=""] 関連付いた語彙
	 * @return {Kuromoji.IpadicFeatures[] | null}
	 */
	pickUp (vocabulary = "") { return (this.isAvailable(vocabulary) && this.get(vocabulary)[ Math.floor(Math.random() * this.get(vocabulary).length) ]) || null }
}

/**
 * 語彙間連結辞書における、関連付いた語彙のオブジェクト
 * @typedef {String | Kuromoji.IpadicFeatures} ConnectionDictionary.Vocabulary
 */



module.exports = Generator;