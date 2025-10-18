package com.example.broach.features.home.ui.data

data class CaseHistoryItem(
    val date: String,
    val time: String,
    val organization: String,
    val description: String,
    val isCase: Boolean // Distinguishes between Case and Service History
)
