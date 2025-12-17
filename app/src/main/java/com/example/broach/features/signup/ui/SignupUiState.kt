package com.example.broach.features.signup.ui

sealed class SignupUiState {
    object Idle : SignupUiState()
    object Loading : SignupUiState()
    data class Success(val userId: String, val authToken: String) : SignupUiState()
    data class Error(val message: String) : SignupUiState()
}