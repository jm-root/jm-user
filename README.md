# jm-user

general user service

## use:

```javascript
var s = require('jm-user')();
```

## run:

```javascript
npm start
```

## 配置参数

基本配置 请参考 [jm-server] (https://github.com/jm-root/jm-server)

db [] mongodb服务器Uri

secret [''] 密钥

sequenceUserId ['userId'] uid序列名称

modelName ['user'] model名称

tableName [''] 表名称, 默认同modelName

tableNamePrefix [''] 表名称前缀

disableAutoUid [false] 禁用自动Uid生成
