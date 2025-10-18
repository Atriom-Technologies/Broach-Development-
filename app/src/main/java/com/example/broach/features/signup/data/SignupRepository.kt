package com.example.broach.features.signup.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.SignupRequest
import com.example.broach.network.SignupResponse
import org.json.JSONObject

class SignupRepository(private val apiService: ApiService) {

    private suspend fun <T : Any> executeRequest(call: suspend () -> retrofit2.Response<T>): Result<T> {
        return try {
            val response = call.invoke()
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (!errorBody.isNullOrBlank()) {
                    try {
                        // Try to parse a specific 'message' field from a JSON object
                        val errorJson = JSONObject(errorBody)
                        errorJson.getString("message")
                    } catch (e: Exception) {
                        // If parsing fails, return the raw error body as it may be a simple string
                        errorBody
                    }
                } else {
                    "Signup failed with code: ${response.code()}"
                }
                Result.Error(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun signupReporter(request: SignupRequest): Result<SignupResponse> {
        return executeRequest { apiService.signupReporter(request) }
    }

    suspend fun signupOrganization(request: OrganizationSignupRequest): Result<SignupResponse> {
        return executeRequest { apiService.signupOrganization(request) }
    }
}
