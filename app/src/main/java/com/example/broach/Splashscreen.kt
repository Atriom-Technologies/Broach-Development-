package com.example.broach

import android.content.Intent
import android.os.Bundle
import android.os.Looper
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivitySplashscreenBinding
import android.os.Handler // Correct import for android.os.Handler

class Splashscreen : AppCompatActivity() {

    private lateinit var binding: ActivitySplashscreenBinding
    private lateinit var handler: android.os.Handler // Use the specific Handler class
    private val autoNavigateRunnable = Runnable {
        navigateToScreen2()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySplashscreenBinding.inflate(layoutInflater)
        setContentView(binding.root)

        handler = Handler(Looper.getMainLooper())

        // Post delayed action to auto-navigate after 3 seconds
        handler.postDelayed(autoNavigateRunnable, 3000) // 3000 ms = 3 seconds

        // Set click listener for manual navigation
        binding.btnNext.setOnClickListener {
            navigateToScreen2()
        }
    }

    private fun navigateToScreen2() {
        // Cancel any pending auto-navigation (just in case)
        handler.removeCallbacks(autoNavigateRunnable)

        // Navigate to Screen2
        startActivity(Intent(this, Splashscreen2::class.java))
        finish()
        overridePendingTransition(
            android.R.anim.fade_in,
            android.R.anim.fade_out
        ) // Optional animation
    }

    override fun onDestroy() {
        // Clean up handler to prevent memory leaks
        handler.removeCallbacks(autoNavigateRunnable)
        super.onDestroy()
    }
}