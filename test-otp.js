// Test script to demonstrate OTP functionality
// Run this with: node test-otp.js

const exampleMutations = `
# 1. Create a new user (this will send OTP email)
mutation CreateUser {
  createUser(
    name: "John Doe"
    email: "john.doe@example.com"
    password: "securepassword123"
  ) {
    user {
      id
      name
      email
    }
    message
    userId
  }
}

# 2. Verify OTP (replace userId and otp with actual values)
mutation VerifyOTP {
  verifyOTP(
    userId: "YOUR_USER_ID_HERE"
    otp: "123456"
  ) {
    success
    message
    user {
      id
      name
      email
    }
  }
}

# 3. Resend OTP if needed
mutation ResendOTP {
  resendOTP(userId: "YOUR_USER_ID_HERE") {
    success
    message
  }
}

# 4. Login after verification
mutation LoginUser {
  loginUser(
    email: "john.doe@example.com"
    password: "securepassword123"
  ) {
    id
    name
    email
  }
}
`;

console.log('🔐 OTP Email Verification System');
console.log('================================');
console.log('');
console.log('This system implements:');
console.log('✅ User registration with email verification');
console.log('✅ OTP generation and storage in Redis');
console.log('✅ Email sending with beautiful HTML template');
console.log('✅ OTP verification with expiration (10 minutes)');
console.log('✅ Resend OTP functionality');
console.log('');
console.log('Example GraphQL mutations:');
console.log(exampleMutations);
console.log('');
console.log('📧 Email Configuration:');
console.log('- SMTP Host: smtp-relay.brevo.com');
console.log('- From: Phyquie <ayushking6395@gmail.com>');
console.log('- OTP Expiration: 10 minutes');
console.log('');
console.log('🗄️ Redis Storage:');
console.log('- Key format: otp:{userId}');
console.log('- TTL: 600 seconds (10 minutes)');
console.log('- Auto-cleanup after verification');
console.log('');
console.log('🚀 To test:');
console.log('1. Start your server: npm run dev');
console.log('2. Open Apollo Studio: http://localhost:4000/graphql');
console.log('3. Run the CreateUser mutation');
console.log('4. Check your email for the OTP');
console.log('5. Use the VerifyOTP mutation with the received OTP');
console.log('6. Login with the verified account'); 