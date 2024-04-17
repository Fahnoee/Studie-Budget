function MatchingPasswords(password, passwordCheck) {
    if (password != passwordCheck) {
        alert("Passwords do not match.");
        console.log('Hep foer return');
        return false; // Prevent form submission
    } else {
        return true;
    }
}








