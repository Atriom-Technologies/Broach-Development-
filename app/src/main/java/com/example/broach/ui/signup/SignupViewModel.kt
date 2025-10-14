package com.example.broach.ui.signup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.example.broach.network.SignupRequest

class SignupViewModel(private val repository: SignupRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle)
    val uiState: StateFlow<SignupUiState> = _uiState

    val fullName = MutableStateFlow("")
    val email = MutableStateFlow("")
    val phone = MutableStateFlow("")
    val password = MutableStateFlow("")
    val confirmPassword = MutableStateFlow("")

    fun onSignupClicked(isOrganization: Boolean) {
        _uiState.value = SignupUiState.Loading

        val request = SignupRequest(
            fullName = fullName.value,
            email = email.value,
            phone = phone.value,
            password = password.value,
            confirmPassword = confirmPassword.value
        )

        viewModelScope.launch {
            val result = repository.signup(request, isOrganization)
            result.onSuccess {
                _uiState.value = SignupUiState.Success(it.message)
            }.onFailure {
                _uiState.value = SignupUiState.Error(it.message ?: "An unknown error occurred.")
            }
        }
    }
}