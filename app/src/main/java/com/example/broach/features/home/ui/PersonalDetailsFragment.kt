package com.example.broach.features.home.ui

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.example.broach.R
import com.example.broach.databinding.FragmentPersonalDetailsBinding
import java.util.Calendar

class PersonalDetailsFragment : Fragment() {

    private var _binding: FragmentPersonalDetailsBinding? = null
    private val binding get() = _binding!!

    private var selectedGender: String? = null
    private var photoUri: Uri? = null

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            data?.data?.let {
                photoUri = it
                binding.btnImage.setImageURI(it)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPersonalDetailsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupGenderSelection()
        setupDatePicker()
        setupPhotoUpload()

        binding.btnContinue.setOnClickListener {
            if (validateInput()) {
                val intent = Intent(requireActivity(), HomeActivity::class.java).apply {
                    putExtra("USER_ROLE", "Reporter/Requester")
                }
                startActivity(intent)
            }
        }
    }

    private fun setupGenderSelection() {
        binding.btnMale.setOnClickListener {
            selectedGender = "Male"
            binding.btnMale.isSelected = true
            binding.btnFemale.isSelected = false
            updateGenderButtons()
        }

        binding.btnFemale.setOnClickListener {
            selectedGender = "Female"
            binding.btnFemale.isSelected = true
            binding.btnMale.isSelected = false
            updateGenderButtons()
        }
    }

    private fun updateGenderButtons() {
        binding.btnMale.setBackgroundColor(if (binding.btnMale.isSelected) requireContext().getColor(R.color.primary_color2) else requireContext().getColor(R.color.light_gray))
        binding.btnFemale.setBackgroundColor(if (binding.btnFemale.isSelected) requireContext().getColor(R.color.primary_color2) else requireContext().getColor(R.color.light_gray))
    }

    private fun setupDatePicker() {
        binding.etDob.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            DatePickerDialog(requireContext(), {
                _, selectedYear, selectedMonth, selectedDay ->
                val selectedDate = "$selectedDay/${selectedMonth + 1}/$selectedYear"
                binding.etDob.setText(selectedDate)
            }, year, month, day).show()
        }
    }

    private fun setupPhotoUpload() {
        binding.btnUploadPhoto.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            pickImageLauncher.launch(intent)
        }
    }

    private fun validateInput(): Boolean {
        binding.tilDob.error = null
        binding.tilOccupation.error = null

        if (selectedGender == null) {
            Toast.makeText(requireContext(), "Please select a gender", Toast.LENGTH_SHORT).show()
            return false
        }
        if (binding.etDob.text.isNullOrEmpty()) {
            binding.tilDob.error = "Please enter your date of birth"
            return false
        }
        if (binding.etOccupation.text.isNullOrEmpty()) {
            binding.tilOccupation.error = "Please enter your occupation"
            return false
        }
        if (photoUri == null) {
            Toast.makeText(requireContext(), "Please upload a photo", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
