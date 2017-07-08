import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let schemaDefine = {
    uid: {type: Number, unique: true, sparse: true, index: true}, // 用户ID号
    account: {type: String, unique: true, sparse: true, index: true},   // 帐户
    email: {type: String, unique: true, sparse: true, index: true},     // 邮箱
    mobile: {type: String, unique: true, sparse: true, index: true},    // 手机号
    password: {type: String}, // 密码，按salt加密后的密文
    salt: {type: String},
    wechat: {type: String},     // 微信号
    nick: {type: String},       // 昵称，可重复
    gender: {type: String},     // 性别
    country: {type: String},    // 国家
    province: {type: String},   // 省
    city: {type: String},        // 市
    area: {type: String},        // 区
    birthday: {type: Date},     // 生日
    active: {type: Boolean, default: true}, // 是否激活
    status: {type: Number, default: 1},    // -1:已删除 0:无效 1:有效
    creator: {type: Schema.Types.ObjectId, ref: 'user'},    // 创建人,介绍人等等
    crtime: {type: Date, default: Date.now},     // 创建时间
    moditime: {type: Date},                       // 修改时间
    ext: Schema.Types.Mixed,     // 其他，保留字段
};

export default function (schema) {
    schema || (schema = new Schema());
    schema.add(schemaDefine);
    return schema;
};
