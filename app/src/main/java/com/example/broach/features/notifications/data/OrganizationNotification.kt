package com.example.broach.features.notifications.data

import com.example.broach.features.notifications.ui.OrganizationNotificationStatus

data class OrganizationNotification(
    val id: String,
    val date: String,
    val title: String,
    val userName: String,
    val category: String,
    val userProfileImageUrl: String,
    val status: OrganizationNotificationStatus,
    val type: NotificationType
)
