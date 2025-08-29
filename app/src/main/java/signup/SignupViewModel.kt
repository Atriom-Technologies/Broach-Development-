package signup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import network.SignupRequest

class SignupViewModel(private val repository: SignupRepository) : ViewModel() {

    // UI state holder
    private val _uiState = MutableStateFlow<SignupUiState>(SignupUiState.Idle)
    val uiState: StateFlow<SignupUiState> = _uiState

    // Form data fields
    val fullName = MutableStateFlow("")
    val email = MutableStateFlow("")
    val phoneNumber = MutableStateFlow("")
    val password = MutableStateFlow("")

    fun onSignupClicked(isOrganization: Boolean) {
        // Validate form data
        if (!validateForm()) {
            return
        }

        _uiState.value = SignupUiState.Loading

        val request = SignupRequest(
            fullName = fullName.value,
            email = email.value,
            phoneNumber = phoneNumber.value,
            password = password.value
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

    private fun validateForm(): Boolean {
        // Basic validation logic
        if (fullName.value.isBlank() || email.value.isBlank() || phoneNumber.value.isBlank() || password.value.isBlank()) {
            _uiState.value = SignupUiState.Error("All fields must be filled.")
            return false
        }
        return true
    }
}
