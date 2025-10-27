package com.example.broach.features.splash.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.databinding.ActivitySplashscreenBinding
import com.example.broach.features.clarification.ui.ClarificationActivity

class Splashscreen : AppCompatActivity() {

    private lateinit var binding: ActivitySplashscreenBinding
    private lateinit var adapter: SplashscreenAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashscreenBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = SplashscreenAdapter(this)
        binding.viewPager.adapter = adapter
    }

    fun next() {
        if (binding.viewPager.currentItem < adapter.itemCount - 1) {
            binding.viewPager.currentItem++
        } else {
            val intent = Intent(this, ClarificationActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    fun previous() {
        if (binding.viewPager.currentItem > 0) {
            binding.viewPager.currentItem--
        }
    }
}