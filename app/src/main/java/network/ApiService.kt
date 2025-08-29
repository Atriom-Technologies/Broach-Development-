
package network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// Data class for a generic signup request
data class SignupRequest(
    val fullName: String,
    val email: String,
    val phoneNumber: String,
    val password: String
)

// Data class for a generic signup response
data class SignupResponse(
    val message: String
)

// New data class for the Organization's specific request
data class OrganizationSignupRequest(
    val organizationName: String,
    val email: String,
    val phoneNumber: String,
    val password: String
)
// Data class for the login request body
data class LoginRequest(
    val email: String,
    val password: String
)

// Data class for the login response
data class LoginResponse(
    val message: String,
    val authToken: String // Assuming the API returns an authentication token
)

interface ApiService {
    // Endpoint for Reporter/Requester signup
    @POST("/api/auth/register-requester")
    suspend fun signupReporter(@Body request: SignupRequest): Response<SignupResponse>

    // Endpoint for Support Organization signup
    @POST("/api/auth/register-organization")
    suspend fun signupOrganization(@Body request: OrganizationSignupRequest): Response<SignupResponse>

    // Existing login endpoint
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
}
