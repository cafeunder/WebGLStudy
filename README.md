# WebGLStudy
特にありません。

## ビルド方法
- nodejsがインストールされていることを前提とします。
 - 開発はv6.9.4で行われています。
- gulpがグローバルにインストールされている必要があります。gulpコマンドが存在しない場合は、以下のコマンドを実行してください。
```
npm install gulp -g
```
- 初回のみ、以下のコマンドで必要なパッケージをインストールします。
```
npm install
```
- 以下のコマンドを実行すると、js/ディレクトリにスクリプトが生成されます。
```
gulp
```
- NODE_ENVの値がproductionの場合は最小構成のファイルが、それ以外の場合はデバッグ用のファイルが生成されます。

## 実行方法
上記の手順でビルドを行った後、index.htmlをwebブラウザで読み込んでください。ブラウザはchromeを推奨します。

## Copyright
copyright(C) 2016-2017 cafeunder.
