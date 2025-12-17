package com.example.broach.features.login.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.features.login.data.UpdatePasswordRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class UpdatePasswordUiState {
    object Idle : UpdatePasswordUiState()
    object Loading : UpdatePasswordUiState()
    object Success : UpdatePasswordUiState()
    data class Error(val message: String) : UpdatePasswordUiState()
}

class UpdatePasswordViewModel(private val repository: UpdatePasswordRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<UpdatePasswordUiState>(UpdatePasswordUiState.Idle)
    val uiState: StateFlow<UpdatePasswordUiState> = _uiState

    fun resetPassword(password: String, token: String) {
        viewModelScope.launch {
            _uiState.value = UpdatePasswordUiState.Loading
            val result = repository.resetPassword(password, token)
            result.onSuccess {
                _uiState.value = UpdatePasswordUiState.Success
            }.onFailure {
                _uiState.value = UpdatePasswordUiState.Error(it.message ?: "An unknown error occurred")
            }
        }
    }
}