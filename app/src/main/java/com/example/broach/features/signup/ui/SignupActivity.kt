package com.example.broach.features.signup.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivitySignupBinding

class SignupActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignupBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userCategory = intent.getStringExtra("USER_CATEGORY")

        if (savedInstanceState == null) {
            val fragment = if (userCategory == "Reporter/Requester") {
                ReporterSignupFragment()
            } else {
                OrganizationSignupFragment()
            }
            supportFragmentManager.beginTransaction()
                .replace(binding.fragmentContainer.id, fragment)
                .commit()
        }
    }
}