package com.example.broach.features.profile.data

data class ProfileHistoryItem(
    val organizationName: String,
    val caseType: String,
    val date: String,
    val organizationLogoUrl: String? = null // Optional: for loading the logo
)