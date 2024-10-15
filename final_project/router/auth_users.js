const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate if the user exists
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  // Authenticate the user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate JWT Token if authentication is successful
  const accessToken = jwt.sign({ username: username }, 'yourSecretKey', { expiresIn: '1h' });
  console.log(accessToken)
  // Save the token in the session
  req.session.authorization = {
    accessToken
  };

  return res.status(200).send("Customer successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;

  // Check if the user is logged in
  if (!req.session.authorization) {
    return res.status(401).send("Unauthorized");
  }

  // Get the username from the JWT token in the session
  const accessToken = req.session.authorization.accessToken;
  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, 'yourSecretKey');
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  const username = decodedToken.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }

  // Check if the review content is provided
  if (!review) {
    return res.status(400).send("Review content is required");
  }

  // Get the reviews for the book
  const bookReviews = books[isbn].reviews || {};

  // Add or update the user's review
  bookReviews[username] = review;

  // Update the book's reviews
  books[isbn].reviews = bookReviews;

  return res.status(200).send(`Review added/updated successfully for book with ISBN: ${isbn}`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check if the user is logged in
  if (!req.session.authorization) {
    return res.status(401).send("Unauthorized");
  }

  // Get the username from the JWT token in the session
  const accessToken = req.session.authorization.accessToken;
  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, 'yourSecretKey');
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  const username = decodedToken.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }

  // Get the reviews for the book
  const bookReviews = books[isbn].reviews || {};

  // Check if the user's review exists
  if (!bookReviews[username]) {
    return res.status(404).send("No review found for this user");
  }

  // Delete the user's review
  delete bookReviews[username];

  // Update the book's reviews
  books[isbn].reviews = bookReviews;

  // Return the plain string success message
  return res.send(`Review for the ISBN ${isbn} posted by "${username}" deleted`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;