package com.example.broach.features.notifications.data

import com.example.broach.features.notifications.ui.NotificationStatus

enum class NotificationType {
    CASE, SERVICE
}

data class Notification(
    val id: String,
    val date: String,
    val title: String,
    val organizationName: String,
    val category: String,
    val organizationLogoUrl: String,
    val status: NotificationStatus,
    val type: NotificationType,
    val removalTime: String? = null
)
