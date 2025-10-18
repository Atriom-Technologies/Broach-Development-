package com.example.broach.features.splash.ui

import android.R
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivitySplashscreen2Binding

class Splashscreen2 : AppCompatActivity() {
    private lateinit var binding: ActivitySplashscreen2Binding
    private lateinit var handler: Handler // Use the specific Handler class
    private val autoNavigateRunnable = Runnable {
        navigateToScreen3()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySplashscreen2Binding.inflate(layoutInflater)
        setContentView(binding.root)

        handler = Handler(Looper.getMainLooper())

        // Post delayed action to auto-navigate after 3 seconds
        handler.postDelayed(autoNavigateRunnable, 3000) // 3000 ms = 3 seconds

        // Set click listener for manual navigation
        binding.btnNext.setOnClickListener {
            navigateToScreen3()
        }
        binding.btnBack.setOnClickListener {
            startActivity(Intent(this, Splashscreen::class.java))
            finish()
        }

    }

    private fun navigateToScreen3() {
        // Cancel any pending auto-navigation (just in case)
        handler.removeCallbacks(autoNavigateRunnable)

        // Navigate to Screen2
        startActivity(Intent(this, Splashscreen3::class.java))
        finish()
        overridePendingTransition(
            R.anim.fade_in,
            R.anim.fade_out
        ) // Optional animation
    }

    override fun onDestroy() {
        // Clean up handler to prevent memory leaks
        handler.removeCallbacks(autoNavigateRunnable)
        super.onDestroy()
    }
}


