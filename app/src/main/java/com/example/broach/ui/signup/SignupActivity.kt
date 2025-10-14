package com.example.broach.ui.signup

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.broach.databinding.ActivitySignupBinding
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding

    private val viewModel: SignupViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(SignupViewModel::class.java)) {
                    val apiService = RetrofitClient.createService(ApiService::class.java)
                    val repository = SignupRepository(apiService)
                    @Suppress("UNCHECKED_CAST")
                    return SignupViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userCategory = intent.getStringExtra("USER_CATEGORY")

        val fragment = when (userCategory) {
            "Reporter/Requester" -> ReporterSignupFragment()
            "Support Organization" -> OrganizationSignupFragment()
            else -> ReporterSignupFragment() // Fallback
        }

        supportFragmentManager.beginTransaction()
            .replace(binding.fragmentContainer.id, fragment)
            .commit()
    }
}
