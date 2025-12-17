package com.example.broach.common

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("BroachAppPrefs", Context.MODE_PRIVATE)

    companion object {
        const val AUTH_TOKEN = "auth_token"
        const val USER_ID = "user_id"
        const val USER_NAME = "user_name"
        const val USER_IMAGE_URL = "user_image_url"
    }

    fun saveAuthToken(token: String) {
        prefs.edit().putString(AUTH_TOKEN, token).apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString(AUTH_TOKEN, null)
    }

    fun saveUserId(userId: String) {
        prefs.edit().putString(USER_ID, userId).apply()
    }

    fun getUserId(): String? {
        return prefs.getString(USER_ID, null)
    }

    fun saveUserName(name: String) {
        prefs.edit().putString(USER_NAME, name).apply()
    }

    fun getUserName(): String? {
        return prefs.getString(USER_NAME, null)
    }

    fun saveUserImageUrl(imageUrl: String) {
        prefs.edit().putString(USER_IMAGE_URL, imageUrl).apply()
    }

    fun getUserImageUrl(): String? {
        return prefs.getString(USER_IMAGE_URL, null)
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
