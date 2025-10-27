package com.example.broach.features.profile.ui

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.canhub.cropper.CropImage
import com.canhub.cropper.CropImageView
import com.example.broach.databinding.ActivityAdjustPhotoBinding

class AdjustPhotoActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdjustPhotoBinding

    private val cropImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val uri = CropImage.getActivityResult(result.data)?.uriContent
            val resultIntent = Intent()
            resultIntent.data = uri
            setResult(Activity.RESULT_OK, resultIntent)
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdjustPhotoBinding.inflate(layoutInflater)
        setContentView(binding.root)

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
        val cropImage = CropImage.activity(uri)
            .setGuidelines(CropImageView.Guidelines.ON)
            .setAspectRatio(16, 9) // Example aspect ratio for a cover photo
            .getIntent(this)
        cropImageLauncher.launch(cropImage)
    }
}