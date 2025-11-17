package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.canhub.cropper.CropImageContract
import com.canhub.cropper.CropImageContractOptions
import com.canhub.cropper.CropImageOptions
import com.canhub.cropper.CropImageView
import com.example.broach.databinding.ActivityAdjustPhotoBinding

class AdjustPhotoActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdjustPhotoBinding

    private val cropImageLauncher = registerForActivityResult(CropImageContract()) { result ->
        if (result.isSuccessful) {
            val uri = result.uriContent
            val resultIntent = Intent()
            resultIntent.data = uri
            setResult(Activity.RESULT_OK, resultIntent)
        }
        // After the cropper is finished (either by cropping or cancelling),
        // we finish this activity to go back to the profile.
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdjustPhotoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowTitleEnabled(false) // The title is already in the XML

        val imageUri = intent.data

        if (imageUri != null) {
            launchCropper(imageUri)
        } else {
            finish() // No image to adjust
        }

        binding.btnBackToOptions.setOnClickListener {
            finish() // Go back to the previous screen
        }
    }

    private fun launchCropper(uri: Uri) {
        val cropOptions = CropImageOptions().apply {
            guidelines = CropImageView.Guidelines.ON
            aspectRatioX = 16
            aspectRatioY = 9
            fixAspectRatio = true
        }
        val options = CropImageContractOptions(uri, cropOptions)
        cropImageLauncher.launch(options)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}