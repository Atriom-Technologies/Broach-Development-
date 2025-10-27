package com.example.broach.features.home.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val userRole = intent.getStringExtra("USER_ROLE")
        val name = intent.getStringExtra("USER_NAME")
        val imageUrl = intent.getStringExtra("USER_IMAGE_URL")

        val fragment = when (userRole) {
            "Reporter/Requester" -> RequesterHomeFragment.newInstance(name, imageUrl)
            "Support Organization" -> OrganizationHomeFragment.newInstance(name, imageUrl)
            else -> RequesterHomeFragment.newInstance(name, imageUrl) // Default fragment
        }

        supportFragmentManager.beginTransaction()
            .replace(binding.fragmentContainer.id, fragment)
            .commit()
    }
}