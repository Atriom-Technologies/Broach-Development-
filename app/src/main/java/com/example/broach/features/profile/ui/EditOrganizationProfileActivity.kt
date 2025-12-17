package com.example.broach.features.profile.ui

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.ActivityEditOrganizationProfileBinding
import com.example.broach.features.details.ui.DetailsViewModel

class EditOrganizationProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditOrganizationProfileBinding
    private val viewModel: DetailsViewModel by viewModels { ViewModelFactory(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditOrganizationProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // TODO: Implement UI and logic for editing organization profile
    }
}