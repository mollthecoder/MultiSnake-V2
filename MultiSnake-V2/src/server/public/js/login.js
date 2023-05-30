// Function to handle the login form submission

function hashPassword(password) {
  password = CryptoJS.SHA256(password);
  return password.toString();
}

function handleLogin(event) {
    event.preventDefault(); // Prevent form submission
  
    // Get the form inputs
    const form = document.querySelector('.form');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
  
    // Get the values from the inputs
    const email = emailInput.value;
    const password =hashPassword(passwordInput.value);
  
    // Create the request body
    const requestBody = JSON.stringify({
      email: email,
      password: password
    });
  
    // Send a POST request to the login endpoint
    fetch('/login', {
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
  
  
  // Attach the event listener to the login form
  const form = document.querySelector('.form');
  form.addEventListener('submit', handleLogin);
  