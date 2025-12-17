package com.example.broach.features.casereport.ui

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.broach.features.casereport.data.CaseReportDropdowns
import com.example.broach.features.casereport.data.CaseReportRepository
import com.example.broach.network.CreateCaseDto
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Defines a structure for the backend's error response that accepts a list of messages
data class ApiErrorResponse(val message: List<String>?)

sealed interface CaseReportUiState {
    object Idle : CaseReportUiState
    object Loading : CaseReportUiState
    data class DropdownsLoaded(val dropdowns: CaseReportDropdowns) : CaseReportUiState
    object CaseReported : CaseReportUiState
    data class Error(val message: String, val error: Throwable? = null) : CaseReportUiState
}

class CaseReportViewModel(private val repository: CaseReportRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<CaseReportUiState>(CaseReportUiState.Idle)
    val uiState: StateFlow<CaseReportUiState> = _uiState.asStateFlow()

    fun getDropdownData() {
        viewModelScope.launch {
            _uiState.value = CaseReportUiState.Loading
            try {
                val dropdowns = repository.getCaseReportDropdowns()
                _uiState.value = CaseReportUiState.DropdownsLoaded(dropdowns)
            } catch (e: Exception) {
                _uiState.value = CaseReportUiState.Error(e.message ?: "An unknown error occurred", e)
            }
        }
    }

    fun createCase(case: CreateCaseDto) {
        viewModelScope.launch {
            _uiState.value = CaseReportUiState.Loading
            try {
                val response = repository.createCase(case)
                if (response.isSuccessful) {
                    _uiState.value = CaseReportUiState.CaseReported
                } else {
                    var errorMessage = "Failed to create case report."
                    val errorBody = response.errorBody()?.string() // Read the error body once
                    if (errorBody != null) {
                        Log.e("CaseReportViewModel", "Raw error response: $errorBody")
                        try {
                            val errorResponse = Gson().fromJson(errorBody, ApiErrorResponse::class.java)
                            // Join the list of messages into a single, readable string
                            errorMessage = errorResponse.message?.joinToString(separator = "\n") ?: errorMessage
                        } catch (e: Exception) {
                            Log.e("CaseReportViewModel", "Failed to parse error response", e)
                        }
                    }
                    _uiState.value = CaseReportUiState.Error(errorMessage)
                }
            } catch (e: Exception) {
                _uiState.value = CaseReportUiState.Error(e.message ?: "An unknown error occurred", e)
            }
        }
    }
}