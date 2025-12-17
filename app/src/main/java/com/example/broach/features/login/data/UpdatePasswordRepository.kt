package com.example.broach.features.login.data

import com.example.broach.network.ApiService
import com.example.broach.network.ResetPasswordRequest
import com.example.broach.network.ResetPasswordResponse

class UpdatePasswordRepository(private val apiService: ApiService) {

    suspend fun resetPassword(password: String, token: String): Result<ResetPasswordResponse> {
        return try {
            val request = ResetPasswordRequest(newPassword = password, confirmPassword = password, token = token)
            val response = apiService.resetPassword(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to reset password"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}