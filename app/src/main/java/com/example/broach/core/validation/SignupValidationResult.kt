package com.example.broach.core.validation

sealed class SignupValidationResult {
    object Success : SignupValidationResult()
    data class Failure(val message: String) : SignupValidationResult()
}