package com.example.broach.features.details.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.core.result.Result
import com.example.broach.features.details.data.DetailsRepository
import com.example.broach.network.DetailsResponse
import com.example.broach.network.Sector
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

sealed interface DetailsUiState {
    object Idle : DetailsUiState
    object Submitting : DetailsUiState
    data class Success(val response: DetailsResponse) : DetailsUiState
    data class Error(val message: String) : DetailsUiState
}

sealed interface SectorUiState {
    object Loading : SectorUiState
    data class Success(val sectors: List<Sector>) : SectorUiState
    data class Error(val message: String) : SectorUiState
}

class DetailsViewModel(private val repository: DetailsRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<DetailsUiState>(DetailsUiState.Idle)
    val uiState: StateFlow<DetailsUiState> = _uiState

    private val _sectorState = MutableStateFlow<SectorUiState>(SectorUiState.Loading)
    val sectorState: StateFlow<SectorUiState> = _sectorState

    init {
        getSectors()
    }

    private fun getSectors() {
        viewModelScope.launch {
            when (val result = repository.getSectors()) {
                is Result.Success -> _sectorState.value = SectorUiState.Success(result.data)
                is Result.Error -> _sectorState.value = SectorUiState.Error(result.exception.message ?: "Failed to load sectors")
            }
        }
    }

    fun submitReporterDetails(
        userId: String,
        gender: String,
        dateOfBirth: String,
        occupation: String,
        image: MultipartBody.Part
    ) {
        viewModelScope.launch {
            _uiState.value = DetailsUiState.Submitting
            when (val result = repository.submitReporterDetails(userId, gender, dateOfBirth, occupation, image)) {
                is Result.Success -> _uiState.value = DetailsUiState.Success(result.data)
                is Result.Error -> _uiState.value = DetailsUiState.Error(result.exception.message ?: "Submission failed")
            }
        }
    }

    fun submitOrganizationDetails(
        userId: String,
        sectorId: String,
        dateEstablished: String,
        organizationSize: String,
        address: String,
        alternatePhone: String,
        logo: MultipartBody.Part
    ) {
        viewModelScope.launch {
            _uiState.value = DetailsUiState.Submitting
            when (val result = repository.submitOrganizationDetails(userId, sectorId, dateEstablished, organizationSize, address, alternatePhone, logo)) {
                is Result.Success -> _uiState.value = DetailsUiState.Success(result.data)
                is Result.Error -> _uiState.value = DetailsUiState.Error(result.exception.message ?: "Submission failed")
            }
        }
    }
}