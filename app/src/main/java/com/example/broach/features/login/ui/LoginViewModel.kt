package com.example.broach.features.login.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.features.login.data.LoginRepository
import com.example.broach.network.LoginRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class LoginViewModel(private val repository: LoginRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            val loginRequest = LoginRequest(email, password)
            val result = repository.login(loginRequest)

            result.onSuccess { loginResponse ->
                _uiState.value = LoginUiState.Success(
                    authToken = loginResponse.authToken,
                    userId = loginResponse.userId,
                    userType = loginResponse.userType,
                    name = loginResponse.name,
                    imageUrl = loginResponse.imageUrl,
                    isDetailsSubmitted = loginResponse.isDetailsSubmitted ?: false
                )
            }.onFailure { exception ->
                _uiState.value = LoginUiState.Error(exception.message ?: "An unknown error occurred")
            }
        }
    }
}
