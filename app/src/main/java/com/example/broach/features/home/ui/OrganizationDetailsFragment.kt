package com.example.broach.features.home.ui

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.example.broach.R
import com.example.broach.databinding.FragmentOrganizationDetailsBinding
import java.util.Calendar

class OrganizationDetailsFragment : Fragment() {

    private var _binding: FragmentOrganizationDetailsBinding? = null
    private val binding get() = _binding!!
    private var logoUri: Uri? = null

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            data?.data?.let {
                logoUri = it
                binding.btnImage.setImageURI(it)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationDetailsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupSectorDropdown()
        setupOrgSizeDropdown()
        setupDatePicker()
        setupLogoUpload()

        binding.btnContinue.setOnClickListener {
            if (isInputValid()) {
                val intent = Intent(requireActivity(), HomeActivity::class.java).apply {
                    putExtra("USER_ROLE", "Support Organization")
                }
                startActivity(intent)
                activity?.finish()
            }
        }
    }

    private fun setupSectorDropdown() {
        val sectors = resources.getStringArray(R.array.organization_sectors)
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, sectors)
        binding.tvSector.setAdapter(adapter)
    }

    private fun setupOrgSizeDropdown() {
        val sizes = arrayOf("1-10", "11-50", "51-200", "201-500", "500+")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, sizes)
        binding.tvOrgSize.setAdapter(adapter)
    }

    private fun setupDatePicker() {
        binding.etDateEstablished.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            DatePickerDialog(requireContext(), {
                _, selectedYear, selectedMonth, selectedDay ->
                val selectedDate = "$selectedDay/${selectedMonth + 1}/$selectedYear"
                binding.etDateEstablished.setText(selectedDate)
            }, year, month, day).show()
        }
    }

    private fun setupLogoUpload() {
        binding.btnUploadPhoto.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            pickImageLauncher.launch(intent)
        }
    }

    private fun isInputValid(): Boolean {
        binding.tilSector.error = null
        binding.tilDateEstablished.error = null
        binding.tilOrgSize.error = null
        binding.tilAddress.error = null
        binding.tilAltContact.error = null

        if (binding.tvSector.text.isNullOrEmpty()) {
            binding.tilSector.error = "Please select a sector"
            return false
        }
        if (binding.etDateEstablished.text.isNullOrEmpty()) {
            binding.tilDateEstablished.error = "Please enter the date of establishment"
            return false
        }
        if (binding.tvOrgSize.text.isNullOrEmpty()) {
            binding.tilOrgSize.error = "Please select an organization size"
            return false
        }
        if (binding.etAddress.text.isNullOrEmpty()) {
            binding.tilAddress.error = "Please enter your address"
            return false
        }
        if (binding.etAltContact.text.isNullOrEmpty()) {
            binding.tilAltContact.error = "Please enter an alternate contact"
            return false
        }
        if (logoUri == null) {
            Toast.makeText(requireContext(), "Please upload a logo", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}