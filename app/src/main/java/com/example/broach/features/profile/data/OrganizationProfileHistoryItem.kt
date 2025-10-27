package com.example.broach.features.profile.data

data class OrganizationProfileHistoryItem(
    val requesterName: String,
    val caseType: String,
    val date: String,
    val requesterImageUrl: String? = null // Optional: for loading the requester's image
)