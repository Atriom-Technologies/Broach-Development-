package com.example.broach.ui.login

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val userType: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}