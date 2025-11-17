package com.example.broach.features.signup.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.core.result.Result
import com.example.broach.features.signup.data.SignupRepository
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.SignupRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SignupViewModel(private val repository: SignupRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle)
    val uiState: StateFlow<SignupUiState> = _uiState

    fun signupOrganization(request: OrganizationSignupRequest) {
        viewModelScope.launch {
            _uiState.value = SignupUiState.Loading
            val result = repository.signupOrganization(request)
            _uiState.value = when (result) {
                is Result.Success -> SignupUiState.Success(result.data)
                is Result.Error -> SignupUiState.Error(result.exception.message ?: "An unknown error occurred")
            }
        }
    }

    fun signupReporter(request: SignupRequest) {
        viewModelScope.launch {
            _uiState.value = SignupUiState.Loading
            val result = repository.signupReporter(request)
            _uiState.value = when (result) {
                is Result.Success -> SignupUiState.Success(result.data)
                is Result.Error -> SignupUiState.Error(result.exception.message ?: "An unknown error occurred")
            }
        }
    }
}