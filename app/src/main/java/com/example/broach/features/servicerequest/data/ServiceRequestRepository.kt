package com.example.broach.features.servicerequest.data

import com.example.broach.network.ApiService
import com.example.broach.network.CreateServiceDto
import com.example.broach.network.MetaItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext

class ServiceRequestRepository(private val apiService: ApiService) {

    suspend fun getServiceRequestDropdowns() = withContext(Dispatchers.IO) {
        val whoNeedsServiceDeferred = async { apiService.getMetaItems("whoIsReporting") }
        val ageRangeDeferred = async { apiService.getMetaItems("ageRange") }
        val serviceTypesDeferred = async { apiService.getMetaItems("serviceTypes") }
        val maritalStatusDeferred = async { apiService.getMetaItems("maritalStatus") }
        val workStatusDeferred = async { apiService.getMetaItems("employmentStatus") }
        val vulnerabilityStatusesDeferred = async { apiService.getMetaItems("vulnerabilityStatuses") }

        val whoNeedsService = whoNeedsServiceDeferred.await()
        val ageRange = ageRangeDeferred.await()
        val serviceTypes = serviceTypesDeferred.await()
        val maritalStatus = maritalStatusDeferred.await()
        val workStatus = workStatusDeferred.await()
        val vulnerabilityStatuses = vulnerabilityStatusesDeferred.await()

        ServiceRequestDropdowns(
            whoNeedsService = if (whoNeedsService.isSuccessful) whoNeedsService.body() else null,
            ageRange = if (ageRange.isSuccessful) ageRange.body() else null,
            serviceTypes = if (serviceTypes.isSuccessful) serviceTypes.body() else null,
            maritalStatus = if (maritalStatus.isSuccessful) maritalStatus.body() else null,
            workStatus = if (workStatus.isSuccessful) workStatus.body() else null,
            vulnerabilityStatuses = if (vulnerabilityStatuses.isSuccessful) vulnerabilityStatuses.body() else null
        )
    }

    suspend fun createService(service: CreateServiceDto) = apiService.createService(service)
}

data class ServiceRequestDropdowns(
    val whoNeedsService: List<MetaItem>?,
    val ageRange: List<MetaItem>?,
    val serviceTypes: List<MetaItem>?,
    val maritalStatus: List<MetaItem>?,
    val workStatus: List<MetaItem>?,
    val vulnerabilityStatuses: List<MetaItem>?
)
