package com.example.broach.network

import com.google.gson.annotations.SerializedName

// DTO for victim details, matching backend expectations
data class VictimDetailsDto(
    @SerializedName("ageRange") val ageRange: String,
    @SerializedName("employmentStatus") val employmentStatus: String,
    @SerializedName("gender") val gender: String,
    @SerializedName("vulnerabilityStatusId") val vulnerabilityStatusId: String? 
)

// DTO for assailant details, matching backend expectations
data class AssailantDetailsDto(
    @SerializedName("noOfAssailants") val noOfAssailants: String,
    @SerializedName("gender") val gender: String,
    @SerializedName("ageRange") val ageRange: String
)

// Updated DTO for creating a new case with nested objects
data class CreateCaseDto(
    @SerializedName("whoIsReporting") val whoIsReporting: String,
    @SerializedName("typeOfAssaultId") val typeOfAssaultId: String,
    @SerializedName("location") val location: String?,
    @SerializedName("description") val description: String,
    @SerializedName("infoConfirmed") val infoConfirmed: Boolean,
    @SerializedName("victimDetails") val victimDetails: VictimDetailsDto?,
    @SerializedName("assailantDetails") val assailantDetails: AssailantDetailsDto
)
