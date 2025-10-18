package com.example.broach.features.home.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivityDetailsBinding

class DetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDetailsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userRole = intent.getStringExtra("USER_ROLE")

        val fragment = when (userRole) {
            "Reporter/Requester" -> PersonalDetailsFragment()
            "Support Organization" -> OrganizationDetailsFragment()
            else -> PersonalDetailsFragment() // Default fragment
        }

        supportFragmentManager.beginTransaction()
            .replace(binding.fragmentContainer.id, fragment)
            .commit()
    }
}