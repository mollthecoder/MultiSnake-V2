function hashPassword(password) {
    password = CryptoJS.SHA256(password);
    return password.toString();
  }
  
  // Function to handle the update username button click event
  async function handleUpdateUsername() {
    const newUsername = prompt('Enter your new username:');
    if (newUsername) {
      try {
        const response = await fetch('/account', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uid:userUid, newUsername })
        });
        const data = await response.json();
        handleRes(data)
      } catch (error) {
        displayNotif(response.message,"red")
        console.error('Error updating username:', error.message);
      }
    }
  }
  
  // Function to handle the update password button click event
  async function handleUpdatePassword() {
    const newPassword = hashPassword(prompt('Enter your new password:'));
    if (newPassword) {
      try {
        const response = await fetch('/account', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uid: userUid, newPassword })
        });
  
        const data = await response.json();
        handleRes(data);
      } catch (error) {
        displayNotif(error.message,"red")
        console.error('Error updating password:', error.message);
      }
    }
  }
  
  // Function to handle the delete account button click event
  async function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      try {
        const response = await fetch('/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uid: userUid })
        });
  
       const data = await response.json();
       handleRes(data)
      } catch (error) {
        displayNotif(error.message,"red")
        console.error('Error deleting account:', error.message);
      }
    }
  }
  
  // Event listeners for button clicks
  document.getElementById('updateUsernameBtn').addEventListener('click', handleUpdateUsername);
   document.getElementById('updatePasswordBtn').addEventListener('click', handleUpdatePassword);
  document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
  
