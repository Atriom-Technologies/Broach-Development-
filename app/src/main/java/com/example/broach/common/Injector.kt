package com.example.broach.common

import android.content.Context
import com.example.broach.features.casereport.data.CaseReportRepository
import com.example.broach.features.details.data.DetailsRepository
import com.example.broach.features.login.data.LoginRepository
import com.example.broach.features.login.data.UpdatePasswordRepository
import com.example.broach.features.servicerequest.data.ServiceRequestRepository
import com.example.broach.features.signup.data.SignupRepository
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient

object Injector {

    private fun getApiService(context: Context): ApiService {
        return RetrofitClient.getInstance(context).create(ApiService::class.java)
    }

    fun provideLoginRepository(context: Context): LoginRepository {
        return LoginRepository(getApiService(context))
    }

    fun provideSignupRepository(context: Context): SignupRepository {
        return SignupRepository(getApiService(context))
    }

    fun provideCaseReportRepository(context: Context): CaseReportRepository {
        return CaseReportRepository(getApiService(context))
    }

    fun provideServiceRequestRepository(context: Context): ServiceRequestRepository {
        return ServiceRequestRepository(getApiService(context))
    }

    fun provideUpdatePasswordRepository(context: Context): UpdatePasswordRepository {
        return UpdatePasswordRepository(getApiService(context))
    }

    fun provideDetailsRepository(context: Context): DetailsRepository {
        return DetailsRepository(getApiService(context))
    }
}