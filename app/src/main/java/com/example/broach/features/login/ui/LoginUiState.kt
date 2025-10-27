package com.example.broach.features.login.ui

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(
        val userType: String, 
        val isDetailsSubmitted: Boolean,
        val name: String?,
        val imageUrl: String?
    ) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}