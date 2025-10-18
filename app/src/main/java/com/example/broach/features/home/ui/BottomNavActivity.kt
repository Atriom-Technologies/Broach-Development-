package com.example.broach.features.home.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.example.broach.R
import com.example.broach.databinding.ActivityBottomNavBinding
import com.example.broach.features.home.ui.RequesterHomeFragment
import com.example.broach.features.home.ui.tabs.NotificationsFragment
import com.example.broach.features.home.ui.tabs.ChatFragment
import com.example.broach.features.home.ui.tabs.ProfileFragment

class BottomNavActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBottomNavBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBottomNavBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set the initial fragment to the Home screen
        if (savedInstanceState == null) {
            replaceFragment(RequesterHomeFragment())
        }

        binding.bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> replaceFragment(RequesterHomeFragment())
                R.id.nav_notifications -> replaceFragment(NotificationsFragment()) // Placeholder
                R.id.nav_chat -> replaceFragment(ChatFragment()) // Placeholder
                R.id.nav_profile -> replaceFragment(ProfileFragment()) // Placeholder
            }
            true
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(binding.fragmentContainer.id, fragment)
            .commit()
    }
}