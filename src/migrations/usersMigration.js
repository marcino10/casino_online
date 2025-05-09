const User = require('../models/User');
const auth = require('../controllers/authController')

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
    for (const user of usersMigration) {
        const req = { body: user };
        const res = {
            status: (code) => {
                res.statusCode = code;
                return res;
            },
            json: (data) => {
                console.log(`User created: ${data.message}`);
            },
        };
        const next = (err) => {
            if (err) console.error(`Error creating user: ${err.message}`);
        };

        await auth.register(req, res, next);
    }
    console.log('✅ User migration completed');
}

async function down() {
    await User.deleteMany({});
    console.log('✅ User migration rolled back');
}

module.exports = { up, down };