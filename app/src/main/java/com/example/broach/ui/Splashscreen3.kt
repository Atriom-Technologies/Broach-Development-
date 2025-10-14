package com.example.broach.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivitySplashscreen3Binding

class Splashscreen3 : AppCompatActivity() {
    private lateinit var binding: ActivitySplashscreen3Binding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySplashscreen3Binding.inflate(layoutInflater)
        setContentView(binding.root)

        // Navigate to ClarificationPageActivity when "Continue" is clicked
        binding.btnContinue.setOnClickListener {
            startActivity(Intent(this, ClarificationActivity::class.java))
            finish()
        }

        //Navigate back to Splashscreen2Activity when "Back" is clicked
        binding.btnBack.setOnClickListener {
            startActivity(Intent(this, Splashscreen2::class.java))
            finish()
        }
    }
}