const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.zzvewclkeqskhlsqmreq',
  password: 'MashaweerDb123!',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect(err => {
  if (err) {
    console.error('Connection error (5432 direct):', err.message);
  } else {
    console.log('✅ Connected successfully to 5432 direct!');
  }
  client.end();
});
