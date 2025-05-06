const pool = require('../db');

// ======================== Table Setup ========================
const createSensorDataTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS sensor_data (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            temperature NUMERIC,
            humidity NUMERIC,
            air_quality NUMERIC,
            light_intensity NUMERIC
        );
    `;
    try {
        await pool.query(query);
        console.log('sensor_data table ready.');
    } catch (err) {
        console.error('Error creating table:', err.message);
        throw err;
    }
};

// ======================== CRUD Operations ========================
const createSensorData = async (data) => {
    const query = `
        INSERT INTO sensor_data 
            (temperature, humidity, air_quality, light_intensity)
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
    `;
    
    const values = [
        data.temperature,
        data.humidity,
        data.airQuality,
        data.lightIntensity
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

const getAllSensorData = async () => {
    try {
        const result = await pool.query('SELECT * FROM sensor_data LIMIT 5');
        return result.rows;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getSensorDataById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM sensor_data WHERE id = $1', [id]);
        return result.rows[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteSensorData = async (id) => {
    try {
        const result = await pool.query(`
            DELETE FROM sensor_data 
            WHERE id = $1 
            RETURNING *
        `, [id]);
        return result.rows[0];
    } catch (err) {
        throw new Error(err.message);
    }
};

// ======================== Specialized Queries ========================
const getSensorDataWithinRange = async (timeParams) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM sensor_data
            WHERE timestamp BETWEEN 
                NOW() - INTERVAL '${timeParams.timeEnd} hours' AND 
                NOW() - INTERVAL '${timeParams.timeStart} hours'
        `);
        return result.rows;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getRecentSensorData = async (limit = 10) => {
    try {
        const result = await pool.query(`
            SELECT * 
            FROM sensor_data 
            ORDER BY timestamp DESC 
            LIMIT $1
        `, [limit]);
        return result.rows;
    } catch (err) {
        throw new Error(err.message);
    }
};

// ======================== Module Exports ========================
module.exports = {
    createSensorDataTable,
    createSensorData,
    getAllSensorData,
    getSensorDataById,
    deleteSensorData,
    getSensorDataWithinRange,
    getRecentSensorData
};