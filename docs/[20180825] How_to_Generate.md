# Note - 文章生成の機構について

```Json
{
	"createdAt": [2018, 8, 25],
	"updatedAt": [2018, 8, 27]
}
```


## 前提処理
1.	[総理の演説・記者会見など | 記者会見 | 首相官邸ホームページ](https://www.kantei.go.jp/jp/98_abe/statement)に掲載されている文書の形態素解析を行う


## 処理行程
1.	形態素解析データからランダムで1文を抽出する
	> 理由は後述
2.	抽出したデータの`名詞`, `動詞`のみ、形態素解析データから生成された単語辞書を基に、ランダムで抽出された単語を代入する
	> 文章の正確性を上げるため
3.	文章を文字列化して返す