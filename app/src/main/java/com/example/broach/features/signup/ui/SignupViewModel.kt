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

    val fullName = MutableStateFlow("")
    val organizationName = MutableStateFlow("")
    val email = MutableStateFlow("")
    val phone = MutableStateFlow("")
    val password = MutableStateFlow("")
    val confirmPassword = MutableStateFlow("")

    fun onSignupClicked(isOrganization: Boolean) {
        _uiState.value = SignupUiState.Loading

        viewModelScope.launch {
            val result = if (isOrganization) {
                val request = OrganizationSignupRequest(
                    organizationName = organizationName.value,
                    email = email.value,
                    phone = phone.value,
                    password = password.value,
                    confirmPassword = confirmPassword.value
                )
                repository.signupOrganization(request)
            } else {
                val request = SignupRequest(
                    fullName = fullName.value,
                    email = email.value,
                    phone = phone.value,
                    password = password.value,
                    confirmPassword = confirmPassword.value
                )
                repository.signupReporter(request)
            }

            when (result) {
                is Result.Success -> {
                    _uiState.value = SignupUiState.Success(result.data.message)
                }
                is Result.Error -> {
                    _uiState.value = SignupUiState.Error(result.exception.message ?: "An unknown error occurred.")
                }
            }
        }
    }
}
