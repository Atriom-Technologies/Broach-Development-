package com.example.broach.features.details.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.DetailsResponse
import com.example.broach.network.Sector
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.lang.Exception

data class ErrorResponse(
    @SerializedName("message")
    val errorMessage: String?
)

class DetailsRepository(private val apiService: ApiService) {

    private fun createPartFromString(string: String) = string.toRequestBody("text/plain".toMediaTypeOrNull())

    private fun getErrorMessage(errorBody: String?): String {
        if (errorBody.isNullOrBlank()) return "An unknown error occurred (empty error body)"
        return try {
            val gson = Gson()
            val errorResponse = gson.fromJson(errorBody, ErrorResponse::class.java)
            errorResponse.errorMessage ?: "Could not parse error message from: $errorBody"
        } catch (e: Exception) {
            errorBody
        }
    }

    suspend fun getSectors(): Result<List<Sector>> {
        return try {
            val response = apiService.getSectors()
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                Result.Error(Exception(getErrorMessage(errorBody)))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun submitReporterDetails(
        userId: String,
        gender: String,
        dateOfBirth: String,
        occupation: String,
        image: MultipartBody.Part
    ): Result<DetailsResponse> {
        return try {
            val response = apiService.submitReporterDetails(
                userId = createPartFromString(userId),
                gender = createPartFromString(gender),
                dateOfBirth = createPartFromString(dateOfBirth),
                occupation = createPartFromString(occupation),
                image = image
            )
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                Result.Error(Exception(getErrorMessage(errorBody)))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun submitOrganizationDetails(
        userId: String,
        sectorId: String,
        dateEstablished: String,
        organizationSize: String,
        address: String,
        alternatePhone: String,
        logo: MultipartBody.Part
    ): Result<DetailsResponse> {
        return try {
            val response = apiService.submitOrganizationDetails(
                userId = createPartFromString(userId),
                sectorId = createPartFromString(sectorId),
                dateEstablished = createPartFromString(dateEstablished),
                organizationSize = createPartFromString(organizationSize),
                address = createPartFromString(address),
                alternatePhone = createPartFromString(alternatePhone),
                logo = logo
            )
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                Result.Error(Exception(getErrorMessage(errorBody)))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}