package com.example.broach.features.login.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.core.result.Result
import com.example.broach.features.login.data.LoginRepository
import com.example.broach.network.LoginRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

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

                    val userType = result.data.userType?.trim() ?: ""


                    val role = if (userType.equals("support_organization", ignoreCase = true)) {
                        "Support Organization"
                    } else {
                        "Reporter/Requester"
                    }
                    
                    val isDetailsSubmitted = result.data.isDetailsSubmitted ?: false
                    LoginUiState.Success(
                        userType = role,
                        isDetailsSubmitted = isDetailsSubmitted,
                        name = result.data.name,
                        imageUrl = result.data.imageUrl
                    )
                }
                is Result.Error -> {
                    LoginUiState.Error(message = "Login failed: ${result.exception.message}")
                }
            }
        }
    }
}
