const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Function to read and parse CSV file
function readUsersFromCSV() {
  try {
    const csvData = fs.readFileSync(path.join(__dirname, 'users.csv'), 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const users = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const user = {};
        headers.forEach((header, index) => {
          user[header.trim()] = values[index] ? values[index].trim() : '';
        });
        users.push(user);
      }
    }
    return users;
  } catch (error) {
    console.error('Error reading users.csv:', error);
    return [];
  }
}

// Function to check if a string is a bcrypt hash
function isBcryptHash(str) {
  // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(str);
}

// Main migration function
async function migratePasswords() {
  console.log('Starting password migration...');
  
  const users = readUsersFromCSV();
  let migratedCount = 0;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Check if password is already hashed
    if (!isBcryptHash(user.password)) {
      console.log(`Migrating password for user: ${user.username}`);
      
      try {
        // Hash the plain text password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        users[i].password = hashedPassword;
        migratedCount++;
      } catch (error) {
        console.error(`Error hashing password for ${user.username}:`, error);
      }
    } else {
      console.log(`Password for user ${user.username} is already hashed, skipping...`);
    }
  }
  
  // Write updated users back to CSV file
  const csvContent = 'username,password\n' + users.map(user => `${user.username},${user.password}`).join('\n');
  fs.writeFileSync(path.join(__dirname, 'users.csv'), csvContent);
  
  console.log(`Migration completed! ${migratedCount} passwords were hashed.`);
}

// Run the migration
migratePasswords().catch(console.error); 