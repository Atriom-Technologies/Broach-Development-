package com.example.broach.features.servicerequest.ui

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.features.casereport.ui.ApiErrorResponse
import com.example.broach.features.servicerequest.data.ServiceRequestDropdowns
import com.example.broach.features.servicerequest.data.ServiceRequestRepository
import com.example.broach.network.CreateServiceDto
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ServiceRequestUiState {
    object Idle : ServiceRequestUiState
    object Loading : ServiceRequestUiState
    data class DropdownsLoaded(val dropdowns: ServiceRequestDropdowns) : ServiceRequestUiState
    object ServiceRequestSent : ServiceRequestUiState
    data class Error(val message: String, val error: Throwable? = null) : ServiceRequestUiState
}

class ServiceRequestViewModel(private val repository: ServiceRequestRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ServiceRequestUiState>(ServiceRequestUiState.Idle)
    val uiState: StateFlow<ServiceRequestUiState> = _uiState.asStateFlow()

    fun getDropdownData() {
        viewModelScope.launch {
            _uiState.value = ServiceRequestUiState.Loading
            try {
                val dropdowns = repository.getServiceRequestDropdowns()
                _uiState.value = ServiceRequestUiState.DropdownsLoaded(dropdowns)
            } catch (e: Exception) {
                _uiState.value = ServiceRequestUiState.Error(e.message ?: "An unknown error occurred", e)
            }
        }
    }

    fun createServiceRequest(serviceRequest: CreateServiceDto) {
        viewModelScope.launch {
            _uiState.value = ServiceRequestUiState.Loading
            try {
                val response = repository.createService(serviceRequest)
                if (response.isSuccessful) {
                    _uiState.value = ServiceRequestUiState.ServiceRequestSent
                } else {
                    var errorMessage = "Failed to create service request."
                    val errorBody = response.errorBody()?.string() // Read the error body once
                    if (errorBody != null) {
                        Log.e("ServiceRequestViewModel", "Raw error response: $errorBody")
                        try {
                            val errorResponse = Gson().fromJson(errorBody, ApiErrorResponse::class.java)
                            // Join the list of messages into a single, readable string
                            errorMessage = errorResponse.message?.joinToString(separator = "\n") ?: errorMessage
                        } catch (e: Exception) {
                            Log.e("ServiceRequestViewModel", "Failed to parse error response", e)
                        }
                    }
                    _uiState.value = ServiceRequestUiState.Error(errorMessage)
                }
            } catch (e: Exception) {
                _uiState.value = ServiceRequestUiState.Error(e.message ?: "An unknown error occurred", e)
            }
        }
    }
}
