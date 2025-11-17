package com.example.broach.features.signup.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.SignupRequest
import com.example.broach.network.SignupResponse
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import java.lang.Exception

data class ErrorResponse(
    @SerializedName("message")
    val errorMessage: String?
)

class SignupRepository(private val apiService: ApiService) {

    private fun getErrorMessage(errorBody: String?): String {
        if (errorBody.isNullOrBlank()) return "An unknown error occurred"
        return try {
            val gson = Gson()
            val errorResponse = gson.fromJson(errorBody, ErrorResponse::class.java)
            errorResponse.errorMessage ?: "Failed to parse error response from: $errorBody"
        } catch (e: Exception) {
            errorBody
        }
    }

    suspend fun signupOrganization(request: OrganizationSignupRequest): Result<SignupResponse> {
        return try {
            val response = apiService.signupOrganization(request)
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

    suspend fun signupReporter(request: SignupRequest): Result<SignupResponse> {
        return try {
            val response = apiService.signupReporter(request)
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
