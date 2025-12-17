package com.example.broach.network

import com.google.gson.annotations.SerializedName
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Query

// --- Data Classes ---

// UNIFIED REQUEST/RESPONSE FOR SIGNUP
data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val userType: String
)

data class SignupResponse(
    val message: String,
    val authToken: String,
    val userId: String
)

// REQUEST/RESPONSE FOR LOGIN
data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val message: String?,
    val authToken: String?,
    val userId: String?,
    val userType: String?,
    val isDetailsSubmitted: Boolean?,
    val name: String?,
    val imageUrl: String?
)

// RESPONSE FOR DETAILS SUBMISSION
data class DetailsResponse(
    val name: String?,
    val imageUrl: String?
)

// DATA CLASS FOR SECTORS
data class Sector(
    val id: String,
    val name: String
)

// REQUESTS FOR PROFILE UPDATES (FOR PROFILE EDITING PAGES)
data class UpdateProfileRequest(
    val fullName: String? = null,
    val phone: String? = null,
    val dob: String? = null,
    val occupation: String? = null,
    val location: String? = null
)

data class UpdateOrganizationProfileRequest(
    val organizationName: String? = null,
    val phone: String? = null,
    val dateFounded: String? = null,
    val category: String? = null,
    val address: String? = null
)

// MODELS FOR PROFILE GETTERS
data class UserProfile(
    val fullName: String,
    val email: String,
    val phone: String,
    val dob: String,
    val occupation: String,
    val location: String,
    val profilePictureUrl: String,
    val coverPhotoUrl: String?
)

data class OrganizationProfile(
    val organizationName: String,
    val email: String,
    val phone: String,
    val dateFounded: String,
    val category: String,
    val address: String,
    val profilePictureUrl: String,
    val coverPhotoUrl: String?
)

// Data classes for Password Reset
data class ForgotPasswordRequest(val email: String)
data class ForgotPasswordResponse(val message: String)
data class ResetPasswordRequest(val newPassword: String, val confirmPassword: String, val token: String)
data class ResetPasswordResponse(val message: String)

data class MetaItem(val id: String, val name: String)

interface ApiService {

    // --- Main User Actions ---
    @POST("/api/user/register")
    suspend fun signup(@Body request: SignupRequest): Response<SignupResponse>

    @POST("/api/user/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("/api/user/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    @POST("/api/user/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ResetPasswordResponse>

    // --- Reporter/Requester Endpoints ---
    @Multipart
    @PATCH("/api/user/register")
    suspend fun submitReporterDetails(
        @Part("userId") userId: RequestBody,
        @Part("gender") gender: RequestBody,
        @Part("dateOfBirth") dateOfBirth: RequestBody,
        @Part("occupation") occupation: RequestBody,
        @Part image: MultipartBody.Part
    ): Response<DetailsResponse>

    @GET("/api/user/profile")
    suspend fun getReporterProfile(): Response<UserProfile>

    @PATCH("/api/user/profile")
    suspend fun updateReporterProfile(@Body request: UpdateProfileRequest): Response<Unit>

    @Multipart
    @PATCH("/api/user/profile/picture")
    suspend fun uploadReporterProfilePicture(@Part image: MultipartBody.Part): Response<Unit>

    @Multipart
    @PATCH("/api/user/profile/cover")
    suspend fun uploadReporterCoverPhoto(@Part image: MultipartBody.Part): Response<Unit>

    // --- Organization Endpoints ---
    @Multipart
    @PATCH("/api/user/register/organization")
    suspend fun submitOrganizationDetails(
        @Part("userId") userId: RequestBody,
        @Part("sectorId") sectorId: RequestBody,
        @Part("dateEstablished") dateEstablished: RequestBody,
        @Part("organizationSize") organizationSize: RequestBody,
        @Part("address") address: RequestBody,
        @Part("alternatePhone") alternatePhone: RequestBody,
        @Part logo: MultipartBody.Part
    ): Response<DetailsResponse>

    @GET("/api/organization/profile")
    suspend fun getOrganizationProfile(): Response<OrganizationProfile>

    @PATCH("/api/organization/profile")
    suspend fun updateOrganizationProfile(@Body request: UpdateOrganizationProfileRequest): Response<Unit>

    @GET("/api/meta?type=sectors") // Corrected Path
    suspend fun getSectors(): Response<List<Sector>>

    @Multipart
    @PATCH("/api/organization/profile/picture")
    suspend fun uploadOrganizationProfilePicture(@Part image: MultipartBody.Part): Response<Unit>

    @Multipart
    @PATCH("/api/organization/profile/cover")
    suspend fun uploadOrganizationCoverPhoto(@Part image: MultipartBody.Part): Response<Unit>

    // --- Case and Service Request Endpoints ---

    @GET("/api/meta")
    suspend fun getMetaItems(@Query("type") type: String): Response<List<MetaItem>>

    @POST("/api/cases/create")
    suspend fun createCase(@Body request: CreateCaseDto): Response<Unit>

    @POST("/api/service/create")
    suspend fun createService(@Body request: CreateServiceDto): Response<Unit>
}
