package com.example.broach.features.casereport.data

import com.example.broach.network.ApiService
import com.example.broach.network.CreateCaseDto
import com.example.broach.network.MetaItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext

class CaseReportRepository(private val apiService: ApiService) {

    suspend fun getCaseReportDropdowns() = withContext(Dispatchers.IO) {
        val whoIsReportingDeferred = async { apiService.getMetaItems("whoIsReporting") }
        val caseTypesDeferred = async { apiService.getMetaItems("caseTypes") }
        val locationDeferred = async { apiService.getMetaItems("location") }
        val ageRangeDeferred = async { apiService.getMetaItems("ageRange") }
        val employmentStatusDeferred = async { apiService.getMetaItems("employmentStatus") }
        val noOfAssailantsDeferred = async { apiService.getMetaItems("noOfAssailants") }
        val genderDeferred = async { apiService.getMetaItems("gender") }
        val vulnerabilityStatusesDeferred = async { apiService.getMetaItems("vulnerabilityStatuses") }

        val whoIsReporting = whoIsReportingDeferred.await()
        val caseTypes = caseTypesDeferred.await()
        val location = locationDeferred.await()
        val ageRange = ageRangeDeferred.await()
        val employmentStatus = employmentStatusDeferred.await()
        val noOfAssailants = noOfAssailantsDeferred.await()
        val gender = genderDeferred.await()
        val vulnerabilityStatuses = vulnerabilityStatusesDeferred.await()

        CaseReportDropdowns(
            whoIsReporting = if (whoIsReporting.isSuccessful) whoIsReporting.body() else null,
            caseTypes = if (caseTypes.isSuccessful) caseTypes.body() else null,
            location = if (location.isSuccessful) location.body() else null,
            ageRange = if (ageRange.isSuccessful) ageRange.body() else null,
            employmentStatus = if (employmentStatus.isSuccessful) employmentStatus.body() else null,
            noOfAssailants = if (noOfAssailants.isSuccessful) noOfAssailants.body() else null,
            gender = if (gender.isSuccessful) gender.body() else null,
            vulnerabilityStatuses = if (vulnerabilityStatuses.isSuccessful) vulnerabilityStatuses.body() else null
        )
    }

    suspend fun createCase(case: CreateCaseDto) = apiService.createCase(case)
}

data class CaseReportDropdowns(
    val whoIsReporting: List<MetaItem>?,
    val caseTypes: List<MetaItem>?,
    val location: List<MetaItem>?,
    val ageRange: List<MetaItem>?,
    val employmentStatus: List<MetaItem>?,
    val noOfAssailants: List<MetaItem>?,
    val gender: List<MetaItem>?,
    val vulnerabilityStatuses: List<MetaItem>?
)
