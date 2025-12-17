package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.common.SessionManager
import com.example.broach.databinding.ActivityProfileBinding
import com.example.broach.features.home.ui.HomeActivity
import com.google.android.material.tabs.TabLayoutMediator
import java.util.Locale

class ProfileActivity : AppCompatActivity(), CoverPhotoOptionsFragment.CoverPhotoOptionListener {

    private lateinit var binding: ActivityProfileBinding
    private lateinit var sessionManager: SessionManager

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let {
                val resultIntent = Intent(this, AdjustPhotoActivity::class.java).apply {
                    data = it
                }
                adjustPhotoLauncher.launch(resultIntent)
            }
        }
    }

    private val adjustPhotoLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let {
                Glide.with(this).load(it).into(binding.ivCoverPhoto)
                uploadCroppedImage(it)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        setupBottomNav()
        populateProfileDetails()
        setupClickListeners()
        setupViewPagerAndTabs()
    }

    private fun setupBottomNav() {
        binding.bottomNavView.selectedItemId = R.id.nav_profile
        binding.bottomNavView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    val intent = Intent(this, HomeActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    }
                    startActivity(intent)
                    true
                }
                R.id.nav_profile -> true // Already here
                else -> false
            }
        }
    }

    private fun populateProfileDetails() {
        val userName = sessionManager.getUserName()
        val userImageUrl = sessionManager.getUserImageUrl()

        binding.tvUserName.text = capitalizeWords(userName)
        Glide.with(this)
            .load(userImageUrl)
            .placeholder(R.drawable.ic_person)
            .circleCrop()
            .into(binding.ivProfilePic)

        // Initialize stats to 0
        binding.tvReportsCount.text = "0"
        binding.tvResolvedCount.text = "0"
        binding.tvPendingCount.text = "0"
    }

    private fun setupViewPagerAndTabs() {
        binding.viewPagerHistory.adapter = ProfileViewPagerAdapter(this)
        TabLayoutMediator(binding.tabLayout, binding.viewPagerHistory) { tab, position ->
            tab.text = when (position) {
                0 -> "Reports/Services"
                1 -> "Resolved"
                2 -> "Pending"
                else -> null
            }
        }.attach()
    }

    private fun setupClickListeners() {
        binding.btnSettings.setOnClickListener {
            ProfileOptionsFragment().show(supportFragmentManager, "ProfileOptionsFragment")
        }
        binding.btnChangePhoto.setOnClickListener {
            CoverPhotoOptionsFragment().show(supportFragmentManager, "CoverPhotoOptionsFragment")
        }
        binding.ivEditIcon.setOnClickListener {
            val intent = Intent(this, EditProfileActivity::class.java)
            startActivity(intent)
        }
    }
    
    private fun capitalizeWords(name: String?): String {
        return name?.split(' ')?.joinToString(" ") { 
            it.replaceFirstChar { char -> 
                if (char.isLowerCase()) char.titlecase(Locale.getDefault()) else char.toString() 
            }
        } ?: ""
    }

    override fun onViewCoverClicked() { /* TODO */ }

    override fun onUploadPhotoClicked() {
        openGallery()
    }

    override fun onRepositionCoverClicked() { /* TODO */ }

    override fun onRemoveCoverClicked() { /* TODO */ }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK).apply { type = "image/*" }
        pickImageLauncher.launch(intent)
    }

    private fun uploadCroppedImage(uri: Uri) {
        // TODO: Implement logic to upload the cropped image to your server.
    }
}