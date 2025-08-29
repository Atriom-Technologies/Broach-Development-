package signup

import network.ApiService
import network.OrganizationSignupRequest
import network.SignupRequest
import network.SignupResponse
import retrofit2.Response

class SignupRepository(private val apiService: ApiService) {
    suspend fun signup(
        request: SignupRequest,
        isOrganization: Boolean
    ): Result<SignupResponse> {
        return try {
            val response: Response<SignupResponse> = if (isOrganization) {
                // Call the organization specific API
                apiService.signupOrganization(
                    OrganizationSignupRequest(
                        organizationName = request.fullName,
                        email = request.email,
                        phoneNumber = request.phoneNumber,
                        password = request.password
                    )
                )
            } else {
                // Call the reporter/requester API
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
