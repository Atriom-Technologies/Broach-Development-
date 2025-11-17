package com.example.broach.features.profile.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.core.result.Result
import com.example.broach.features.profile.data.ProfileRepository
import com.example.broach.network.OrganizationProfile
import com.example.broach.network.UpdateOrganizationProfileRequest
import com.example.broach.network.UpdateProfileRequest
import com.example.broach.network.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

sealed interface ProfileUiState {
    object Loading : ProfileUiState
    data class ReporterProfileLoaded(val userProfile: UserProfile) : ProfileUiState
    data class OrganizationProfileLoaded(val organizationProfile: OrganizationProfile) : ProfileUiState
    data class Error(val message: String) : ProfileUiState
}

class ProfileViewModel(private val repository: ProfileRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    fun getReporterProfile() {
        viewModelScope.launch {
            when (val result = repository.getReporterProfile()) {
                is Result.Success -> _uiState.value = ProfileUiState.ReporterProfileLoaded(result.data)
                is Result.Error -> _uiState.value = ProfileUiState.Error(result.exception.message ?: "An unknown error occurred")
            }
        }
    }

    fun updateReporterProfile(request: UpdateProfileRequest) {
        viewModelScope.launch {
            when (repository.updateReporterProfile(request)) {
                is Result.Success -> getReporterProfile() // Refresh data
                is Result.Error -> _uiState.value = ProfileUiState.Error("Failed to update profile")
            }
        }
    }

    fun uploadReporterProfilePicture(image: MultipartBody.Part) {
        viewModelScope.launch {
            when (repository.uploadReporterProfilePicture(image)) {
                is Result.Success -> getReporterProfile() // Refresh data
                is Result.Error -> _uiState.value = ProfileUiState.Error("Failed to upload image")
            }
        }
    }

    fun getOrganizationProfile() {
        viewModelScope.launch {
            when (val result = repository.getOrganizationProfile()) {
                is Result.Success -> _uiState.value = ProfileUiState.OrganizationProfileLoaded(result.data)
                is Result.Error -> _uiState.value = ProfileUiState.Error(result.exception.message ?: "An unknown error occurred")
            }
        }
    }

    fun updateOrganizationProfile(request: UpdateOrganizationProfileRequest) {
        viewModelScope.launch {
            when (repository.updateOrganizationProfile(request)) {
                is Result.Success -> getOrganizationProfile() // Refresh data
                is Result.Error -> _uiState.value = ProfileUiState.Error("Failed to update organization profile")
            }
        }
    }

    fun uploadOrganizationLogo(image: MultipartBody.Part) {
        viewModelScope.launch {
            when (repository.uploadOrganizationLogo(image)) {
                is Result.Success -> getOrganizationProfile() // Refresh data
                is Result.Error -> _uiState.value = ProfileUiState.Error("Failed to upload logo")
            }
        }
    }
}