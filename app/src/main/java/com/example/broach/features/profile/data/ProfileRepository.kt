package com.example.broach.features.profile.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.UpdateProfileRequest
import com.example.broach.network.UserProfile
import java.lang.Exception

class ProfileRepository(private val apiService: ApiService) {

    suspend fun getProfile(): Result<UserProfile> {
        return try {
            val response = apiService.getProfile().body()!!
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun updateProfile(updateProfileRequest: UpdateProfileRequest): Result<Unit> {
        return try {
            apiService.updateProfile(updateProfileRequest)
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}