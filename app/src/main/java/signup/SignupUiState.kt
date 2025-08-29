package signup

sealed class SignupUiState {
    object Idle : SignupUiState()
    object Loading : SignupUiState()
    data class Success(val message: String) : SignupUiState()
    data class Error(val message: String) : SignupUiState()
}