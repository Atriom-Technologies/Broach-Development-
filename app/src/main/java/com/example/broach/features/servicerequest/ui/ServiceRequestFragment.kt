package com.example.broach.features.servicerequest.ui

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.DialogServiceRequestSentBinding
import com.example.broach.databinding.FragmentServiceRequestBinding
import com.example.broach.features.home.ui.HomeActivity
import com.example.broach.features.servicerequest.data.ServiceRequestDropdowns
import com.example.broach.network.CreateServiceDto
import com.example.broach.network.MetaItem
import com.example.broach.network.ServiceDetailsDto
import kotlinx.coroutines.launch

class ServiceRequestFragment : Fragment() {

    private var _binding: FragmentServiceRequestBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ServiceRequestViewModel by viewModels { ViewModelFactory(requireContext()) }

    private var vulnerabilityStatuses: List<MetaItem> = emptyList()
    private var serviceTypes: List<MetaItem> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentServiceRequestBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.toolbar.setNavigationOnClickListener {
            findNavController().navigateUp()
        }

        setupCharCounter()
        setupFormValidation()
        setupDynamicFields()
        observeViewModel()

        viewModel.getDropdownData()

        binding.btnSubmitRequest.setOnClickListener {
            if (validateForm()) {
                val serviceTypeId = serviceTypes.find { it.name == binding.actvTypeOfService.text.toString() }?.id
                val vulnerabilityStatusId = vulnerabilityStatuses.find { it.name == binding.actvVulnerabilityStatus.text.toString() }?.id

                if (serviceTypeId != null && vulnerabilityStatusId != null) {
                    val serviceDetails = ServiceDetailsDto(
                        serviceTypeId = serviceTypeId,
                        maritalStatus = binding.actvMaritalStatus.text.toString(),
                        workStatus = binding.actvWorkStatus.text.toString(),
                        vulnerabilityStatusId = vulnerabilityStatusId,
                        description = binding.etServiceDescription.text.toString()
                    )

                    val isSelfReporting = binding.actvWhoNeedsService.text.toString().equals("Self", ignoreCase = true)
                    val ageRange = if (isSelfReporting) null else binding.actvAgeRange.text.toString()
                    val phone = if (isSelfReporting) null else binding.etPhoneNo.text.toString()
                    val email = if (isSelfReporting) null else binding.etEmailAddress.text.toString()

                    val createServiceDto = CreateServiceDto(
                        whoNeedsThisService = binding.actvWhoNeedsService.text.toString(),
                        ageRange = ageRange,
                        phone = phone,
                        email = email,
                        infoConfirmed = binding.cbDeclaration.isChecked,
                        serviceDetails = serviceDetails
                    )
                    viewModel.createServiceRequest(createServiceDto)
                } else {
                    Toast.makeText(requireContext(), "Invalid selection made", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupDynamicFields() {
        binding.actvWhoNeedsService.doOnTextChanged { text, _, _, _ ->
            val isSelf = text.toString().equals("Self", ignoreCase = true)
            val visibility = if (isSelf) View.GONE else View.VISIBLE

            // Only hide contact and age fields
            binding.contactInfoLayout.visibility = visibility
            binding.ageRangeLayout.visibility = visibility

            if (isSelf) {
                // Clear the fields when they are hidden
                binding.etPhoneNo.text = null
                binding.etEmailAddress.text = null
                binding.actvAgeRange.text = null
            }
            binding.btnSubmitRequest.isEnabled = validateForm()
        }
    }

    private fun setupDropdowns(dropdowns: ServiceRequestDropdowns) {
        vulnerabilityStatuses = dropdowns.vulnerabilityStatuses?.filterNotNull() ?: emptyList()
        serviceTypes = dropdowns.serviceTypes?.filterNotNull() ?: emptyList()

        binding.actvWhoNeedsService.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.whoNeedsService?.mapNotNull { it.name } ?: emptyList()))
        binding.actvAgeRange.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.ageRange?.mapNotNull { it.name } ?: emptyList()))
        binding.actvTypeOfService.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, serviceTypes.mapNotNull { it.name }))
        binding.actvMaritalStatus.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.maritalStatus?.mapNotNull { it.name } ?: emptyList()))
        binding.actvWorkStatus.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.workStatus?.mapNotNull { it.name } ?: emptyList()))
        binding.actvVulnerabilityStatus.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, vulnerabilityStatuses.mapNotNull { it.name }))
    }

    private fun setupCharCounter() {
        binding.etServiceDescription.doOnTextChanged { text, _, _, _ ->
            val charCount = text?.length ?: 0
            binding.tvCharCount.text = "$charCount/200"
        }
    }

    private fun setupFormValidation() {
        val textChangedAction = { _: CharSequence?, _: Int, _: Int, _: Int ->
            binding.btnSubmitRequest.isEnabled = validateForm()
        }

        binding.actvWhoNeedsService.doOnTextChanged(textChangedAction)
        binding.actvAgeRange.doOnTextChanged(textChangedAction)
        binding.etPhoneNo.doOnTextChanged(textChangedAction)
        binding.etEmailAddress.doOnTextChanged(textChangedAction)
        binding.actvTypeOfService.doOnTextChanged(textChangedAction)
        binding.actvMaritalStatus.doOnTextChanged(textChangedAction)
        binding.actvWorkStatus.doOnTextChanged(textChangedAction)
        binding.actvVulnerabilityStatus.doOnTextChanged(textChangedAction)
        binding.etServiceDescription.doOnTextChanged(textChangedAction)

        binding.cbDeclaration.setOnCheckedChangeListener { _, _ ->
            binding.btnSubmitRequest.isEnabled = validateForm()
        }
    }

    private fun validateForm(): Boolean {
        val isSelfReporting = binding.actvWhoNeedsService.text.toString().equals("Self", ignoreCase = true)

        val contactDetailsValid = if (isSelfReporting) {
            true // Contact and Age are not required for Self
        } else {
            !binding.etPhoneNo.text.isNullOrEmpty() &&
                    !binding.etEmailAddress.text.isNullOrEmpty() &&
                    !binding.actvAgeRange.text.isNullOrEmpty()
        }

        // These details are always required
        val serviceDetailsValid = !binding.actvTypeOfService.text.isNullOrEmpty() &&
                !binding.actvMaritalStatus.text.isNullOrEmpty() &&
                !binding.actvWorkStatus.text.isNullOrEmpty() &&
                !binding.actvVulnerabilityStatus.text.isNullOrEmpty() &&
                !binding.etServiceDescription.text.isNullOrEmpty()

        return !binding.actvWhoNeedsService.text.isNullOrEmpty() &&
                contactDetailsValid &&
                serviceDetailsValid &&
                binding.cbDeclaration.isChecked
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uiState.collect {
                when (it) {
                    is ServiceRequestUiState.Loading -> {
                        binding.btnSubmitRequest.isEnabled = false
                    }
                    is ServiceRequestUiState.DropdownsLoaded -> {
                        setupDropdowns(it.dropdowns)
                    }
                    is ServiceRequestUiState.ServiceRequestSent -> {
                        showServiceRequestSentDialog()
                    }
                    is ServiceRequestUiState.Error -> {
                        Log.e("ServiceRequestFragment", "Error: ${it.message}", it.error)
                        Toast.makeText(requireContext(), it.message, Toast.LENGTH_SHORT).show()
                        binding.btnSubmitRequest.isEnabled = validateForm()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun showServiceRequestSentDialog() {
        val dialogBinding = DialogServiceRequestSentBinding.inflate(layoutInflater)
        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogBinding.root)
            .create()

        dialogBinding.btnBackToHome.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(requireActivity(), HomeActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            startActivity(intent)
        }

        dialog.show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
