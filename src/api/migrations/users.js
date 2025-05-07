const User = require('../models/User');

let users = [];

users.push({
    nick: 'test',
    email: 'test@gmail.com',
    password: 'test123',
});
users.push({
    nick: 'test1',
    email: 'test1@gmail.com',
    password: 'test123',
});
users.push({
    nick: 'test2',
    email: 'test2@gmail.com',
    password: 'test123',
});
users.push({
    nick: 'test3',
    email: 'test3@gmail.com',
    password: 'test123',
});
users.push({
    nick: 'test4',
    email: 'test4@gmail.com',
    password: 'test123',
});
users.push({
    nick: 'test5',
    email: 'test5@gmail.com',
    password: 'test123',
});

async function up() {
    await User.insertMany(users);
    console.log('✅ User migration completed');
}

async function down() {
    await User.deleteMany({});
    console.log('✅ User migration rolled back');
}

module.exports = { up, down };