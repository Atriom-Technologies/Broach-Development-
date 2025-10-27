package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.canhub.cropper.CropImage
import com.example.broach.databinding.ActivityOrganizationProfileBinding
import com.google.android.material.tabs.TabLayoutMediator

class OrganizationProfileActivity : AppCompatActivity(), CoverPhotoOptionsFragment.CoverPhotoOptionListener {

    private lateinit var binding: ActivityOrganizationProfileBinding

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri = result.data?.data
            if (imageUri != null) {
                val resultIntent = Intent(this, AdjustPhotoActivity::class.java)
                resultIntent.data = imageUri
                adjustPhotoLauncher.launch(resultIntent)
            }
        }
    }

    private val adjustPhotoLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val croppedUri = result.data?.data
            if (croppedUri != null) {
                binding.ivCoverPhoto.setImageURI(croppedUri)
                uploadCroppedImage(croppedUri) // Placeholder for your upload logic
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrganizationProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the ViewPager and TabLayout
        val viewPager = binding.viewPagerHistory
        val tabLayout = binding.tabLayout

        viewPager.adapter = OrganizationProfileViewPagerAdapter(this)

        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> "All Cases"
                1 -> "Closed Cases"
                2 -> "Pending Cases"
                else -> null
            }
        }.attach()

        // Initialize stats to 0
        binding.tvAllCasesCount.text = "0"
        binding.tvClosedCasesCount.text = "0"
        binding.tvPendingCasesCount.text = "0"

        // Set up settings button click listener
        binding.btnSettings.setOnClickListener {
            val profileOptionsFragment = ProfileOptionsFragment()
            profileOptionsFragment.show(supportFragmentManager, profileOptionsFragment.tag)
        }

        // Set up change cover photo button click listener
        binding.btnChangePhoto.setOnClickListener {
            val coverPhotoOptionsFragment = CoverPhotoOptionsFragment()
            coverPhotoOptionsFragment.show(supportFragmentManager, coverPhotoOptionsFragment.tag)
        }

        // Set up edit profile icon click listener
        binding.ivEditIcon.setOnClickListener {
            val intent = Intent(this, EditOrganizationProfileActivity::class.java)
            startActivity(intent)
        }
    }

    override fun onViewCoverClicked() {
        // TODO: Implement view cover photo logic
    }

    override fun onUploadPhotoClicked() {
        openGallery()
    }

    override fun onRepositionCoverClicked() {
        // This will now be handled by the onUploadPhotoClicked -> adjustPhotoLauncher flow
        // You can also choose to launch AdjustPhotoActivity with the current cover photo URI
    }

    override fun onRemoveCoverClicked() {
        // TODO: Implement remove cover photo logic
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK)
        intent.type = "image/*"
        pickImageLauncher.launch(intent)
    }

    private fun uploadCroppedImage(uri: Uri) {
        // TODO: Implement your logic to upload the cropped image to your server.
        // You can use a library like Retrofit for this.
        // For now, we'll just display the cropped image.
    }
}