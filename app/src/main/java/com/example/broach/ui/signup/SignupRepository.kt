package com.example.broach.ui.signup

import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.SignupRequest
import com.example.broach.network.SignupResponse
import retrofit2.Response

class SignupRepository(private val apiService: ApiService) {
    suspend fun signup(
        request: SignupRequest,
        isOrganization: Boolean
    ): Result<SignupResponse> {
        return try {
            val response: Response<SignupResponse> = if (isOrganization) {
                apiService.signupOrganization(
                    OrganizationSignupRequest(
                        organizationName = request.fullName,
                        email = request.email,
                        phone = request.phone,
                        password = request.password,
                        confirmPassword = request.confirmPassword
                    )
                )
            } else {
                apiService.signupReporter(request)
            }

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Signup failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}