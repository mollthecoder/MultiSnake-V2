// Function to hash the password using SHA256
function hashPassword(password) {
    password = CryptoJS.SHA256(password);
    return password.toString();
  }
  
// Function to handle the signup form submission
function handleSignup(event) {
  event.preventDefault(); // Prevent form submission

  // Get the form inputs
  const form = document.querySelector('.form');
  const usernameInput = form.querySelector('input[name="username"]');
  const emailInput = form.querySelector('input[name="email"]');
  const ageInput = form.querySelector('input[name="age"]');
  const passwordInput = form.querySelector('input[name="password"]');

  // Get the values from the inputs
  const username = usernameInput.value;
  const email = emailInput.value;
  const age = ageInput.value;
  const password = passwordInput.value;

  // Hash the password using SHA256
  const hashedPassword = hashPassword(password);
  // Create the request body
  const requestBody = JSON.stringify({
    username: username,
    email: email,
    age: age,
    password: hashedPassword
  });

  // Send a POST request to the signup endpoint
  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: requestBody
  }).then(response => response.json())
    .then(handleRes)
    .catch(error => {
      displayNotif(error.message,"red")
      console.error('Error:', error);
      // Handle error or show error message
    });
}

// Attach the event listener to the signup form
const form = document.querySelector('.form');
form.addEventListener('submit', handleSignup);
