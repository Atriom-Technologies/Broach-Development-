package com.example.broach.data

import com.example.broach.network.ApiService
import com.example.broach.network.LoginRequest
import com.example.broach.network.LoginResponse
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.SignupRequest
import com.example.broach.network.SignupResponse
import java.lang.Exception

class LoginRepository(private val apiService: ApiService) {

    suspend fun login(loginRequest: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(loginRequest).body()!!
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun registerUser(request: SignupRequest): Result<SignupResponse> {
        return try {
            val response = apiService.signupReporter(request).body()!!
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun registerOrganization(request: OrganizationSignupRequest): Result<SignupResponse> {
        return try {
            val response = apiService.signupOrganization(request).body()!!
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}