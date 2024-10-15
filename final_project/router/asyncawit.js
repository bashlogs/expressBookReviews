const axios = require('axios');

async function getBooks() {
  try {
    const response = await axios.get('https://mayurkhadde2-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/Things Fall Apart');
    console.log('List of books available:', response.data);
  } catch (error) {
    console.error('Error fetching books:', error.message);
  }
}

// Call the function
getBooks();
