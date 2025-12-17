package com.example.broach.features.home.ui

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import com.example.broach.R
import com.example.broach.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Get data from LoginActivity
        val userRole = intent.getStringExtra("USER_ROLE")

        // --- Definitive Test: Log the received data ---
        Log.d("HomeActivity", "Received from Login: Role='${userRole}'")

        val navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        val navGraph = navController.navInflater.inflate(R.navigation.nav_graph)

        // Determine the start destination based on role
        val startDestination = if (userRole.equals("support organization", ignoreCase = true)) {
            R.id.organizationHomeFragment
        } else {
            R.id.requesterHomeFragment
        }

        navGraph.setStartDestination(startDestination)
        navController.graph = navGraph
    }
}
