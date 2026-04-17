// Upon user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Validate user credentials
  // const user = await db.getUser ByEmail(email);
  if (user && validatePassword(password, user.passwordHash)) {
    const sessionToken = generateRandomToken(); // Function to generate a random token
    await db.storeSessionToken(user.id, sessionToken); // Store token in the database
    res.json({ sessionToken });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Middleware to protect routes
function authenticate(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  db.validateSessionToken(token)
    .then(isValid => {
      if (!isValid) return res.status(401).json({ error: 'Invalid token' });
      next();
    })
    .catch(err => res.status(500).json({ error: 'Internal server error' }));
}

// Protecting a route
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'This is a protected route' });
});
