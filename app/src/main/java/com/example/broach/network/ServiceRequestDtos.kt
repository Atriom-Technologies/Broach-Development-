package com.example.broach.network

import com.google.gson.annotations.SerializedName

// Nested DTO for service details, matching the backend specification
data class ServiceDetailsDto(
    @SerializedName("serviceTypeId") val serviceTypeId: String,
    @SerializedName("maritalStatus") val maritalStatus: String,
    @SerializedName("workStatus") val workStatus: String,
    @SerializedName("vulnerabilityStatusId") val vulnerabilityStatusId: String,
    @SerializedName("description") val description: String
)

// Main DTO for creating a service request, matching the backend specification
data class CreateServiceDto(
    @SerializedName("whoNeedsThisService") val whoNeedsThisService: String,
    @SerializedName("ageRange") val ageRange: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("infoConfirmed") val infoConfirmed: Boolean,
    @SerializedName("serviceDetails") val serviceDetails: ServiceDetailsDto
)

data class VulnerabilityStatus(
    val id: String,
    val name: String
)
