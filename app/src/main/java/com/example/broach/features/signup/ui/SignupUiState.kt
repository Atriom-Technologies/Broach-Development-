package com.example.broach.features.signup.ui

import com.example.broach.network.SignupResponse

sealed interface SignupUiState {
    object Idle : SignupUiState
    object Loading : SignupUiState
    data class Success(val response: SignupResponse) : SignupUiState
    data class Error(val message: String) : SignupUiState
}
