const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // If everything is okay, register the user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered, Now you can Login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const booksList = JSON.stringify(books, null, 2);
  return res.status(200).send(`List of books available: \n${booksList}`);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists in the books object
  const book = books[isbn];

  if (book) {
    // Send the book details as a JSON response
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(book, null, 2)); // Pretty-print JSON with 2-space indentation
  } else {
    // If the book is not found, send a 404 error
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Retrieve the author name from the request parameters
  const author = req.params.author.toLowerCase();

  // Initialize an array to store books by the given author
  let booksByAuthor = [];

  // Iterate through the books object
  for (let isbn in books) {
    // Check if the author matches (case-insensitive)
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push({ isbn: isbn, ...books[isbn] });
    }
  }

  // If books are found, return the list
  if (booksByAuthor.length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(booksByAuthor, null, 2)); // Pretty-print JSON with 2-space indentation
  } else {
    // If no books by the author are found, send a 404 response
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let bookFound = null;

  // Iterate through the books object to find a book with the matching title
  for (let isbn in books) {
    if (books[isbn].title === title) {
      bookFound = {
        "isbn": isbn,
        "title": books[isbn].title,
        "author": books[isbn].author,
        "reviews": books[isbn].reviews
      };
      break;
    }
  }

  // If a book is found, send it in the response; otherwise, return an error message
  if (bookFound) {
    return res.status(200).json(bookFound);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    // Directly return an empty object if the reviews are empty
    const reviews = books[isbn].reviews;

    if (Object.keys(reviews).length === 0) {
      return res.json({});
    } else {
      return res.json(reviews);
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;