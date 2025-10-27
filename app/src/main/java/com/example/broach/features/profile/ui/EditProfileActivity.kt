package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.databinding.ActivityEditProfileBinding
import com.example.broach.features.profile.data.ProfileRepository
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient
import com.example.broach.network.UpdateProfileRequest
import com.example.broach.network.UserProfile
import kotlinx.coroutines.launch

class EditProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditProfileBinding

    private val viewModel: ProfileViewModel by viewModels {
        ProfileViewModelFactory(ProfileRepository(RetrofitClient.createService(ApiService::class.java)))
    }

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri = result.data?.data
            binding.ivProfileImage.setImageURI(imageUri)
            // TODO: Handle image upload to your server
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        binding.tvChangePhoto.setOnClickListener {
            openGallery()
        }

        observeUiState()
        viewModel.getProfile()
    }

    private fun observeUiState() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is ProfileUiState.Loading -> {
                        // Show loading indicator
                    }
                    is ProfileUiState.Success -> {
                        state.userProfile?.let { populateUi(it) }
                    }
                    is ProfileUiState.Error -> {
                        Toast.makeText(this@EditProfileActivity, state.message, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun populateUi(userProfile: UserProfile) {
        binding.tvUserName.text = userProfile.fullName
        binding.etFullName.setText(userProfile.fullName)
        binding.etEmail.setText(userProfile.email)
        binding.etPhone.setText(userProfile.phone)
        binding.etDob.setText(userProfile.dob)
        binding.etOccupation.setText(userProfile.occupation)
        binding.etLocation.setText(userProfile.location)
        Glide.with(this).load(userProfile.profilePictureUrl).into(binding.ivProfileImage)
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK)
        intent.type = "image/*"
        pickImageLauncher.launch(intent)
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.edit_profile_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_save -> {
                val updateRequest = UpdateProfileRequest(
                    fullName = binding.etFullName.text.toString(),
                    phone = binding.etPhone.text.toString(),
                    dob = binding.etDob.text.toString(),
                    occupation = binding.etOccupation.text.toString(),
                    location = binding.etLocation.text.toString()
                )
                viewModel.updateProfile(updateRequest)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}