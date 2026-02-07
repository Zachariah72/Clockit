const sendVerificationEmail = (email, code) => {
  console.log(`Sending verification email to ${email} with code ${code}`);
  return Promise.resolve();
};

module.exports = { sendVerificationEmail };