const User = require('../models/User');
const bcrypt = require('bcryptjs');

let usersMigration = [];

usersMigration.push({
    nick: 'test',
    email: 'test@gmail.com',
    password: 'test123',
});
usersMigration.push({
    nick: 'test1',
    email: 'test1@gmail.com',
    password: 'test123',
});
usersMigration.push({
    nick: 'test2',
    email: 'test2@gmail.com',
    password: 'test123',
});
usersMigration.push({
    nick: 'test3',
    email: 'test3@gmail.com',
    password: 'test123',
});
usersMigration.push({
    nick: 'test4',
    email: 'test4@gmail.com',
    password: 'test123',
});
usersMigration.push({
    nick: 'test5',
    email: 'test5@gmail.com',
    password: 'test123',
});


async function up() {
    let users = [];

    for (const {nick, email, password} of usersMigration) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            nick,
            email,
            password: hashedPassword
        })
    }
    console.log('✅ User migration completed');
}

async function down() {
    await User.deleteMany({});
    console.log('✅ User migration rolled back');
}

module.exports = { up, down };