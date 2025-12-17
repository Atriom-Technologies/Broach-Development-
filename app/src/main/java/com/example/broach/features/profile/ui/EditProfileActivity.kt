package com.example.broach.features.profile.ui

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.ActivityEditProfileBinding
import com.example.broach.features.details.ui.DetailsViewModel

class EditProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditProfileBinding
    private val viewModel: DetailsViewModel by viewModels { ViewModelFactory(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // TODO: Implement UI and logic for editing reporter profile
    }
}