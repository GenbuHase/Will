const Status = require("./Status");

module.exports = class MorphableStatus extends Status {
	/**
	 * MorphableStatusモデルを生成
	 * @param {Object} statusData
	 */
	constructor (statusData) {
		super(statusData);
	}

	/**
	 * 全てのURL, ハッシュタグ, カスタム絵文字を除いたトゥート内容を返す
	 * @returns {String}
	 */
	get morphableContent () {
		return this.plainContent
			.replace(/(https?|ftp):\/\/[-_.!~*¥'()a-zA-Z0-9;¥/?:¥@&=+¥$,%#]+/g, "")
			.replace(/(?:[^\w:]|^):(@?\w{2,}):(?=[^\w:]|$)/g, "")
			.replace(/(?:^|[^/\w])@((\w+([\w.]+\w+)?)(?:@[\w.-]+\w+)?)/g, "")
			.replace(/(?:^|[^/)\w\u3041-\u3096\u30A1-\u30FA\u3400-\u9FFF])#([\w\u3041-\u3096\u30A1-\u30FA\u3400-\u9FFF·]*)/ig, "");
	}
};