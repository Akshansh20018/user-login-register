const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

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

// Read users from CSV file
const users = readUsersFromCSV();

// Route to serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// Route to handle form submission
app.post('/submit', (req, res) => {
  console.log('Received:', req.body);
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    res.send('Login successful!');
  } else {
    res.send('Login failed!');
  }
});

// Route to handle registration
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

app.post('/addUser', (req, res) => {
  console.log('Registration attempt:', req.body);
  const { username, password } = req.body;
    
  // Add new user to CSV file
  const newUser = { username, password };
  users.push(newUser);
  
  // Write updated users back to CSV file
  const csvContent = 'username,password\n' + users.map(user => `${user.username},${user.password}`).join('\n');
  fs.writeFileSync(path.join(__dirname, 'users.csv'), csvContent);
  
  res.send('Registration successful! You can now login.');
});

app.get('/checkUsername', (req, res) => {
  console.log('Check username attempt:', req.query);
  const { username } = req.query;
  const user = users.find(user => user.username === username);
  if (user) {
    res.send('Username already exists! Please choose a different username.');
  } else {
    res.send('Username available!');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
