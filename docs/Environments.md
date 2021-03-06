# 環境変数(Environments)


### SHIINA_INSTANCE(String型)
動作させるアカウントがあるインスタンスのURL(ex: https://itabashi.0j0.jp)


### SHIINA_TOKEN(String型)
動作させるアカウントのトークン(書き込み・読み取り属性必須)


### SHIINA_ENV(String型) <初期値: `"production"`>
動作環境
* `"production"` ... 製品用
* `"development"` ... 開発用(以下の項目が実行される)
  * .envファイルの読み込み
  * `SHIINA_MODE`の定義


### SHIINA_MODE(String型) <初期値: `""`>
動作モード(`SHIINA_ENV="development"`の時のみ有効)
* `""` ... 会話BOTモード
* `"learning"` ... 学習モード(連合TLからトゥート取得・学習)
* `"debug"` ... デバッグモード(以下の項目が実行される)
  * リプ内容をevalして返す


### SHIINA_DBPATH(String型) <初期値: `"db/dialogue.db"`>
学習状況を保存するファイルのパス


### SHIINA_DICPATH(String型) <初期値: `"dict"`>
形態素解析に用いる辞書のディレクトリパス


### SHIINA_PORT(Number型) <初期値: `8001`>
Shiinaを動かすポート