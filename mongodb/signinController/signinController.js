
const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }
});

const Login = mongoose.model('Signin', loginSchema);

module.exports = Login;