package com.example.broach.features.details.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.R
import com.example.broach.databinding.ActivityDetailsBinding

class DetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDetailsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userRole = intent.getStringExtra("USER_ROLE")

        if (savedInstanceState == null) {
            val fragment = when (userRole) {
                "Reporter/Requester" -> ReporterDetailsFragment()
                "Support Organization" -> OrganizationDetailsFragment()
                else -> throw IllegalArgumentException("Invalid user role: $userRole")
            }
            supportFragmentManager.beginTransaction()
                .replace(R.id.details_fragment_container, fragment)
                .commit()
        }
    }
}