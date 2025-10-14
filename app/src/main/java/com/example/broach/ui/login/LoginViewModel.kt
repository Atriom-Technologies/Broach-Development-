package com.example.broach.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.data.LoginRepository
import com.example.broach.data.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.example.broach.network.LoginRequest

class LoginViewModel(private val repository: LoginRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading

            val request = LoginRequest(email = username, password = password)
            val result = repository.login(request)

            _uiState.value = when (result) {
                is Result.Success -> {
                    // Check the role from the API response
                    val role = result.data.userType // Assuming the backend response includes a 'role' field
                    LoginUiState.Success(userType = role)
                }
                is Result.Error -> {
                    LoginUiState.Error(message = "Login failed: ${result.exception.message}")
                }
            }
        }
    }
}