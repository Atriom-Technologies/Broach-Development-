package com.example.broach.features.signup.data

import com.example.broach.network.ApiService
import com.example.broach.network.SignupRequest
import com.example.broach.network.SignupResponse
import java.lang.Exception

class SignupRepository(private val apiService: ApiService) {

    suspend fun signup(signupRequest: SignupRequest): Result<SignupResponse> {
        return try {
            val response = apiService.signup(signupRequest)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Signup failed with empty response body"))
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Signup failed with unknown error"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
