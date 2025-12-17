package com.example.broach.features.signup.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.features.signup.data.SignupRepository
import com.example.broach.network.SignupRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SignupViewModel(private val repository: SignupRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle)
    val uiState: StateFlow<SignupUiState> = _uiState

    fun signup(name: String, email: String, password: String, userType: String) {
        viewModelScope.launch {
            _uiState.value = SignupUiState.Loading
            val signupRequest = SignupRequest(name, email, password, userType)
            val result = repository.signup(signupRequest)

            result.onSuccess { signupResponse ->
                _uiState.value = SignupUiState.Success(
                    userId = signupResponse.userId,
                    authToken = signupResponse.authToken
                )
            }.onFailure { exception ->
                _uiState.value = SignupUiState.Error(exception.message ?: "An unknown error occurred")
            }
        }
    }
}