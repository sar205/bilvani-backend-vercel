const Contact = require('../../mongodb/contactUsMongo/contactUsMongo');

// Controller function to handle the submission of the contact form
exports.contact = async (req, res) => {
    try {
        // Extracting data from the request body
        const { name, email, message, subject } = req.body;
    
        // Creating a new contact instance using the Contact model
        const newContact = new Contact({
          name,
          email,
          message,
          subject
        });
    
        // Saving the new contact instance to the database
        await newContact.save();
    
        // Responding with a success message
        res.status(201).json({ message: 'Contact form submitted successfully!' });
      } catch (error) {
        // Handling any errors that occur during the submission process
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
      }
};

