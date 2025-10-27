package com.example.broach.features.profile.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.core.result.Result
import com.example.broach.features.profile.data.ProfileRepository
import com.example.broach.network.UpdateProfileRequest
import com.example.broach.network.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(private val repository: ProfileRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    fun getProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            val result = repository.getProfile()
            _uiState.value = when (result) {
                is Result.Success -> ProfileUiState.Success(result.data)
                is Result.Error -> ProfileUiState.Error(result.exception.message ?: "An error occurred")
            }
        }
    }

    fun updateProfile(updateProfileRequest: UpdateProfileRequest) {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            val result = repository.updateProfile(updateProfileRequest)
            _uiState.value = when (result) {
                is Result.Success -> {
                    getProfile() // Refresh profile data after update
                    ProfileUiState.Success(null) // Or some other success state
                }
                is Result.Error -> ProfileUiState.Error(result.exception.message ?: "An error occurred")
            }
        }
    }
}

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val userProfile: UserProfile?) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}