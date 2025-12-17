package com.example.broach.common

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.broach.features.casereport.ui.CaseReportViewModel
import com.example.broach.features.details.ui.DetailsViewModel
import com.example.broach.features.login.ui.LoginViewModel
import com.example.broach.features.login.ui.UpdatePasswordViewModel
import com.example.broach.features.servicerequest.ui.ServiceRequestViewModel
import com.example.broach.features.signup.ui.SignupViewModel

class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(LoginViewModel::class.java) -> {
                LoginViewModel(Injector.provideLoginRepository(context)) as T
            }
            modelClass.isAssignableFrom(SignupViewModel::class.java) -> {
                SignupViewModel(Injector.provideSignupRepository(context)) as T
            }
            modelClass.isAssignableFrom(CaseReportViewModel::class.java) -> {
                CaseReportViewModel(Injector.provideCaseReportRepository(context)) as T
            }
            modelClass.isAssignableFrom(ServiceRequestViewModel::class.java) -> {
                ServiceRequestViewModel(Injector.provideServiceRequestRepository(context)) as T
            }
            modelClass.isAssignableFrom(UpdatePasswordViewModel::class.java) -> {
                UpdatePasswordViewModel(Injector.provideUpdatePasswordRepository(context)) as T
            }
            modelClass.isAssignableFrom(DetailsViewModel::class.java) -> {
                DetailsViewModel(Injector.provideDetailsRepository(context)) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    }
}