package com.example.broach.data


object SignupValidator {

    fun validateReporterSignup(
        fullName: String,
        email: String,
        phone: String,
        password: String,
        confirmPassword: String
    ): SignupValidationResult {

        if (fullName.isBlank()) {
            return SignupValidationResult.Failure("Full name cannot be empty.")
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return SignupValidationResult.Failure("Please enter a valid email address.")
        }
        if (phone.isBlank() || phone.length < 10) {
            return SignupValidationResult.Failure("Please enter a valid phone number (min 10 digits).")
        }
        if (password.length < 8) {
            return SignupValidationResult.Failure("Password must be at least 8 characters long.")
        }
        val passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+".toRegex()
        if (!password.matches(passwordPattern)) {
            return SignupValidationResult.Failure("Password must contain at least one uppercase letter, one lowercase letter, and one number.")
        }
        if (password != confirmPassword) {
            return SignupValidationResult.Failure("Passwords do not match.")
        }

        return SignupValidationResult.Success
    }

    fun validateOrganizationSignup(
        organizationName: String,
        email: String,
        phone: String,
        password: String,
        confirmPassword: String
    ): SignupValidationResult {

        if (organizationName.isBlank()) {
            return SignupValidationResult.Failure("Organization name cannot be empty.")
        }

        if (phone.isBlank() || phone.length < 10) {
            return SignupValidationResult.Failure("Please enter a valid phone number (min 10 digits).")
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return SignupValidationResult.Failure("Please enter a valid email address.")
        }

        if (password.length < 8) {
            return SignupValidationResult.Failure("Password must be at least 8 characters long.")
        }

        // Check for at least one uppercase letter, one lowercase letter, and one digit.
        val passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+".toRegex()
        if (!password.matches(passwordPattern)) {
            return SignupValidationResult.Failure("Password must contain at least one uppercase letter, one lowercase letter, and one number.")
        }

        if (password != confirmPassword) {
            return SignupValidationResult.Failure("Passwords do not match.")
        }

        return SignupValidationResult.Success
    }
}

