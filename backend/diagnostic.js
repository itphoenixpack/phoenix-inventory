const { getDB, normalizeCompany, pools } = require('./src/config/dbManager');
require('dotenv').config();

async function runDiagnostics() {
    console.log('--- BACKEND DIAGNOSTIC PROTOCOL ---');
    console.log(`Environment: ${process.env.NODE_ENV || 'Not Set'}`);
    console.log(`Port Configured: ${process.env.PORT || 5000}`);

    const diagnosticGoals = [
        { name: 'Phoenix DB Connection', pool: pools.phoenixPool },
        { name: 'Impack DB Connection', pool: pools.impackPool }
    ];

    for (const goal of diagnosticGoals) {
        try {
            console.log(`Checking ${goal.name}...`);
            const client = await goal.pool.connect();
            console.log(`✓ ${goal.name} Established.`);
            const res = await client.query('SELECT NOW()');
            console.log(`  - DB Current Time: ${res.rows[0].now}`);
            client.release();
        } catch (err) {
            console.error(`✗ ${goal.name} FAILED.`);
            console.error(`  - Reason: ${err.message}`);
        }
    }

    console.log('--- DIAGNOSTICS COMPLETE ---');
}

runDiagnostics().then(() => process.exit(0));
