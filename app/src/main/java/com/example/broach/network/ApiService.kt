package com.example.broach.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// Data class for the signup request body
data class SignupRequest(
    val fullName: String,
    val email: String,
    val phone: String,
    val password: String,
    val confirmPassword: String
)

// Data class for the signup response
data class SignupResponse(
    val message: String,
    val userId: String
)

// Data class for the login request body
data class LoginRequest(
    val email: String,
    val password: String
)

data class OrganizationSignupRequest(
    val organizationName: String,
    val email: String,
    val phone: String,
    val password: String,
    val confirmPassword: String
)

// Data class for the login response.
data class LoginResponse(
    val message: String,
    val authToken: String,
    val userType: String,
    val isDetailsSubmitted: Boolean
)

interface ApiService {
    @POST("auth/register")
    suspend fun signupReporter(@Body request: SignupRequest): Response<SignupResponse>

    @POST("auth/register/organization")
    suspend fun signupOrganization(@Body request: OrganizationSignupRequest): Response<SignupResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ResetPasswordResponse>
}


data class ForgotPasswordRequest(
    val email: String
)

data class ForgotPasswordResponse(
    val message: String
)

data class ResetPasswordRequest(
    val newPassword: String,
    val confirmPassword: String,
    val token: String
)

data class ResetPasswordResponse(
    val message: String
)