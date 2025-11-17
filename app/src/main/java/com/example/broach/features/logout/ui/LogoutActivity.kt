package com.example.broach.features.logout.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.R
import com.example.broach.databinding.ActivityLogoutBinding

class LogoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLogoutBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLogoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        // The title is now set in the XML layout, so we don't need to set it here.
        // The fragments will control the visibility of the back arrow.

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.logout_fragment_container, LogoutConfirmationFragment())
                .commit()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}