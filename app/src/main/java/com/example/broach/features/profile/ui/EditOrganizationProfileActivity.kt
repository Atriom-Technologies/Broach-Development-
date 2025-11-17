package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.databinding.ActivityEditOrganizationProfileBinding
import com.example.broach.features.profile.data.ProfileRepository
import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationProfile
import com.example.broach.network.RetrofitClient
import com.example.broach.network.UpdateOrganizationProfileRequest
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream

class EditOrganizationProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditOrganizationProfileBinding

    private val viewModel: ProfileViewModel by viewModels {
        ProfileViewModelFactory(ProfileRepository(RetrofitClient.createService(ApiService::class.java)))
    }

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri = result.data?.data
            if (imageUri != null) {
                binding.ivProfileImage.setImageURI(imageUri)
                val imagePart = uriToMultipart(imageUri)
                viewModel.uploadOrganizationLogo(imagePart)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditOrganizationProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        binding.tvChangePhoto.setOnClickListener {
            openGallery()
        }

        setupSectorDropdown()
        observeUiState()
        viewModel.getOrganizationProfile()
    }

    private fun uriToMultipart(uri: Uri): MultipartBody.Part {
        val inputStream: InputStream? = contentResolver.openInputStream(uri)
        val requestBody = inputStream!!.readBytes().toRequestBody("image/*".toMediaTypeOrNull())
        return MultipartBody.Part.createFormData("image", "logo.jpg", requestBody)
    }

    private fun setupSectorDropdown() {
        val sectors = resources.getStringArray(R.array.organization_sectors)
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, sectors)
        binding.actvSector.setAdapter(adapter)
    }

    private fun observeUiState() {
        var initialLoad = true
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is ProfileUiState.Loading -> {
                        // Show loading indicator
                    }
                    is ProfileUiState.OrganizationProfileLoaded -> {
                        populateUi(state.organizationProfile)
                        if (!initialLoad) {
                            Toast.makeText(this@EditOrganizationProfileActivity, "Profile Updated!", Toast.LENGTH_SHORT).show()
                        }
                        initialLoad = false
                    }
                    is ProfileUiState.Error -> {
                        Toast.makeText(this@EditOrganizationProfileActivity, state.message, Toast.LENGTH_SHORT).show()
                    }
                    else -> { /* Ignore other states like ReporterProfileLoaded */ }
                }
            }
        }
    }

    private fun populateUi(orgProfile: OrganizationProfile) {
        binding.tvOrganizationNameHeader.text = orgProfile.organizationName
        binding.etOrganizationName.setText(orgProfile.organizationName)
        binding.etEmail.setText(orgProfile.email)
        binding.etPhone.setText(orgProfile.phone)
        binding.etDateFounded.setText(orgProfile.dateFounded)
        binding.actvSector.setText(orgProfile.category, false)
        binding.etAddress.setText(orgProfile.address)
        Glide.with(this).load(orgProfile.profilePictureUrl).into(binding.ivProfileImage)
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
                val updateRequest = UpdateOrganizationProfileRequest(
                    organizationName = binding.etOrganizationName.text.toString(),
                    phone = binding.etPhone.text.toString(),
                    dateFounded = binding.etDateFounded.text.toString(),
                    category = binding.actvSector.text.toString(),
                    address = binding.etAddress.text.toString()
                )
                viewModel.updateOrganizationProfile(updateRequest)
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