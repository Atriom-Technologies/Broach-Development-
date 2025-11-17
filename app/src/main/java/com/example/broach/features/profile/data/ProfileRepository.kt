package com.example.broach.features.profile.data

import com.example.broach.core.result.Result
import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationProfile
import com.example.broach.network.UpdateOrganizationProfileRequest
import com.example.broach.network.UpdateProfileRequest
import com.example.broach.network.UserProfile
import okhttp3.MultipartBody
import java.lang.Exception

class ProfileRepository(private val apiService: ApiService) {

    // --- Reporter --- //

    suspend fun getReporterProfile(): Result<UserProfile> {
        return try {
            val response = apiService.getReporterProfile()
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun updateReporterProfile(request: UpdateProfileRequest): Result<Unit> {
        return try {
            val response = apiService.updateReporterProfile(request)
            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun uploadReporterProfilePicture(image: MultipartBody.Part): Result<Unit> {
        return try {
            val response = apiService.uploadReporterProfilePicture(image)
            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    // --- Organization --- //

    suspend fun getOrganizationProfile(): Result<OrganizationProfile> {
        return try {
            val response = apiService.getOrganizationProfile()
            if (response.isSuccessful && response.body() != null) {
                Result.Success(response.body()!!)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun updateOrganizationProfile(request: UpdateOrganizationProfileRequest): Result<Unit> {
        return try {
            val response = apiService.updateOrganizationProfile(request)
            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun uploadOrganizationLogo(image: MultipartBody.Part): Result<Unit> {
        return try {
            // Corrected to call the proper endpoint for the organization logo
            val response = apiService.uploadOrganizationProfilePicture(image)
            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}