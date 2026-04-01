const { Pool } = require('pg');

const normalizeCompany = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'phoenix' || v === 'phx') return 'phoenix';
  if (v === 'impack' || v === 'inpack' || v === 'imp' || v === 'inp') return 'impack';
  return null;
};

const commonConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'root',
  port: Number(process.env.DB_PORT || 5432),
};

const phoenixPool = new Pool({
  ...commonConfig,
  database: process.env.PHOENIX_DB || 'inventory_system',
});

const impackPool = new Pool({
  ...commonConfig,
  database: process.env.IMPACK_DB || 'impack_db',
});

const getDB = (companyRaw) => {
  const company = normalizeCompany(companyRaw) || 'phoenix';
  if (company === 'phoenix') return phoenixPool;
  if (company === 'impack') return impackPool;
  return phoenixPool;
};

module.exports = {
  getDB,
  normalizeCompany,
  pools: { phoenixPool, impackPool },
};

