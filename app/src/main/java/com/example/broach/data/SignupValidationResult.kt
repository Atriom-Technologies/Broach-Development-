package com.example.broach.data

sealed class SignupValidationResult {
    object Success : SignupValidationResult()
    data class Failure(val message: String) : SignupValidationResult()
}