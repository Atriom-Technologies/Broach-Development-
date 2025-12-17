package com.example.broach.features.login.ui

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(
        val authToken: String?,
        val userId: String?,
        val userType: String?,
        val name: String?,
        val imageUrl: String?,
        val isDetailsSubmitted: Boolean
    ) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}