package com.example.broach.features.login.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.LoginRequest
import com.example.broach.network.LoginResponse
import java.lang.Exception

class LoginRepository(private val apiService: ApiService) {

    suspend fun login(loginRequest: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(loginRequest)
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                Result.Error(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

}
