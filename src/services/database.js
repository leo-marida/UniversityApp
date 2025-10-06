// src/services/database.js
import { openDatabase } from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native'; // <-- ADDED: Import Platform module

let db;

// A helper function to promisify the executeSql command, which is the core of the fix.
// This makes the callback-based API usable with async/await, ensuring stability.
const executeSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (tx, results) => {
          resolve(results);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const initDB = async () => {
  // 1. Open the database
  db = await new Promise((resolve, reject) => {
    openDatabase(
      { name: 'UniversityDB.db', location: 'default' },
      dbInstance => {
        console.log('Database OPENED');
        resolve(dbInstance);
      },
      error => {
        console.log('Error opening database:', error);
        reject(error);
      }
    );
  });

  // 2. Create the table if it doesn't exist
  await executeSql(`
    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      web_page TEXT,
      domain TEXT,
      state_province TEXT
    );
  `);

  // 3. Check if the table is already populated
  const countResult = await executeSql('SELECT COUNT(*) as count FROM universities');
  if (countResult.rows.item(0).count > 0) {
    console.log('Database already populated.');
    return;
  }

  // 4. If empty, populate the database from the JSON file
  console.log('Database is empty, populating...');
  try {
    // --- THIS IS THE UPDATED CROSS-PLATFORM BLOCK ---
    let jsonContent;

    if (Platform.OS === 'ios') {
      // For iOS, the file must be added to the Xcode project.
      // The path is relative to the main app bundle.
      // NOTE for Mac developer: Add `universities.json` to Xcode's "Copy Bundle Resources".
      const jsonPath = RNFS.MainBundlePath + '/universities.json';
      jsonContent = await RNFS.readFile(jsonPath, 'utf8');
    } else {
      // For Android, the file is in the native 'assets' directory.
      jsonContent = await RNFS.readFileAssets('data/universities.json');
    }
    // --- END OF UPDATED BLOCK ---

    const universities = JSON.parse(jsonContent);

    // Use a single transaction to insert all data for massive performance improvement
    await db.transaction(async tx => {
      for (const uni of universities) {
        const stateProvince = uni['state-province'] || null;
        const webPage = (uni.web_pages && uni.web_pages[0]) || null;
        const domain = (uni.domains && uni.domains[0]) || null;

        tx.executeSql(
          'INSERT INTO universities (name, country, web_page, domain, state_province) VALUES (?, ?, ?, ?, ?)',
          [uni.name, uni.country, webPage, domain, stateProvince]
        );
      }
    });

    console.log('Database populated successfully.');
  } catch (e) {
    console.error('Failed to populate database:', e);
    throw e;
  }
};

export const getUniversities = async (country = '', page = 1, limit = 20) => {
  if (!db) {
    // This safety check ensures the DB is open before we query it.
    await initDB();
  }

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM universities';
  let params = [];

  if (country) {
    query += ' WHERE country = ?';
    params.push(country);
  }

  query += ` ORDER BY name LIMIT ${limit} OFFSET ${offset}`;
  
  const results = await executeSql(query, params);
  const universities = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    universities.push({
      ...row,
      web_pages: [row.web_page], // Re-wrap in an array to match original data structure
    });
  }
  return universities;
};

export const getCountries = async () => {
  if (!db) {
    await initDB();
  }
  const results = await executeSql('SELECT DISTINCT country FROM universities ORDER BY country ASC');
  const countries = [];
  for (let i = 0; i < results.rows.length; i++) {
    countries.push(results.rows.item(i).country);
  }
  return countries;
};