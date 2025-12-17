package com.example.broach.features.login.data

import com.example.broach.network.ApiService
import com.example.broach.network.LoginRequest
import com.example.broach.network.LoginResponse

class LoginRepository(private val apiService: ApiService) {

    suspend fun login(loginRequest: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(loginRequest)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Invalid credentials or server error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
