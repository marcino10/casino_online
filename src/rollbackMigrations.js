require('dotenv').config({ path: '.env' });

const MONGO_URL = process.env.MONGO_URL;


const mongoose = require('mongoose');
const cardMigration = require('./migrations/cardsMigration');
const userMigration = require('./migrations/usersMigration');

async function run() {
    try {
        await mongoose.connect(MONGO_URL);

        await cardMigration.down();
        await userMigration.down();

        await mongoose.disconnect();
        console.log('🚀 All rollbacks completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Rollback failed:', err);
        process.exit(1);
    }
}

run();
