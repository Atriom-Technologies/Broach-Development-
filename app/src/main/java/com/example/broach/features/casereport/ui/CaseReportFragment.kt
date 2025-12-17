package com.example.broach.features.casereport.ui

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.broach.R
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.DialogCaseReportedBinding
import com.example.broach.databinding.FragmentCaseReportBinding
import com.example.broach.features.casereport.data.CaseReportDropdowns
import com.example.broach.features.home.ui.HomeActivity
import com.example.broach.network.AssailantDetailsDto
import com.example.broach.network.CreateCaseDto
import com.example.broach.network.MetaItem
import com.example.broach.network.VictimDetailsDto
import kotlinx.coroutines.launch

class CaseReportFragment : Fragment() {

    private var _binding: FragmentCaseReportBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CaseReportViewModel by viewModels { ViewModelFactory(requireContext()) }

    private var vulnerabilityStatuses: List<MetaItem> = emptyList()
    private var caseTypes: List<MetaItem> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCaseReportBinding.inflate(inflater, container, false)
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

        binding.btnReportCase.setOnClickListener {
            if (validateForm()) {
                val isSelfReporting = binding.actvReporter.text.toString().equals("Self", ignoreCase = true)

                val caseTypeId = caseTypes.find { it.name == binding.actvAssaultType.text.toString() }?.id

                if (caseTypeId != null) {
                    val victimDetails = if (isSelfReporting) {
                        null
                    } else {
                        VictimDetailsDto(
                            ageRange = binding.actvVictimAge.text.toString(),
                            employmentStatus = binding.actvEmployment.text.toString(),
                            gender = binding.actvVictimGender.text.toString(),
                            vulnerabilityStatusId = vulnerabilityStatuses.find { it.name == binding.actvVulnerability.text.toString() }?.id
                        )
                    }

                    val assailantDetails = AssailantDetailsDto(
                        noOfAssailants = binding.actvAssailantCount.text.toString(),
                        gender = binding.actvAssailantGender.text.toString(),
                        ageRange = binding.actvAssailantAge.text.toString()
                    )

                    val createCaseDto = CreateCaseDto(
                        whoIsReporting = binding.actvReporter.text.toString(),
                        typeOfAssaultId = caseTypeId,
                        location = binding.actvLocation.text.toString(),
                        description = binding.etDescription.text.toString(),
                        infoConfirmed = binding.cbDeclaration.isChecked,
                        victimDetails = victimDetails,
                        assailantDetails = assailantDetails
                    )
                    viewModel.createCase(createCaseDto)
                } else {
                    Toast.makeText(requireContext(), "Invalid case type selected", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupDynamicFields() {
        binding.actvReporter.doOnTextChanged { text, _, _, _ ->
            val isSelf = text.toString().equals("Self", ignoreCase = true)
            val victimContent = view?.findViewById<LinearLayout>(R.id.victimDetailsContent)

            if (isSelf) {
                victimContent?.visibility = View.GONE
                binding.victimDetailsCard.alpha = 0.5f
                binding.actvVictimAge.text = null
                binding.actvEmployment.text = null
                binding.actvVictimGender.text = null
                binding.actvVulnerability.text = null
            } else {
                victimContent?.visibility = View.VISIBLE
                binding.victimDetailsCard.alpha = 1.0f
            }
            binding.btnReportCase.isEnabled = validateForm()
        }
    }

    private fun setupDropdowns(dropdowns: CaseReportDropdowns) {
        vulnerabilityStatuses = dropdowns.vulnerabilityStatuses?.filterNotNull() ?: emptyList()
        caseTypes = dropdowns.caseTypes?.filterNotNull() ?: emptyList()

        binding.actvReporter.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.whoIsReporting?.mapNotNull { it.name } ?: emptyList()))
        binding.actvAssaultType.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, caseTypes.mapNotNull { it.name }))
        binding.actvLocation.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.location?.mapNotNull { it.name } ?: emptyList()))
        binding.actvVictimAge.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.ageRange?.mapNotNull { it.name } ?: emptyList()))
        binding.actvEmployment.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.employmentStatus?.mapNotNull { it.name } ?: emptyList()))
        binding.actvVictimGender.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.gender?.mapNotNull { it.name } ?: emptyList()))
        binding.actvVulnerability.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, vulnerabilityStatuses.mapNotNull { it.name }))
        binding.actvAssailantCount.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.noOfAssailants?.mapNotNull { it.name } ?: emptyList()))
        binding.actvAssailantGender.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.gender?.mapNotNull { it.name } ?: emptyList()))
        binding.actvAssailantAge.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, dropdowns.ageRange?.mapNotNull { it.name } ?: emptyList()))
    }

    private fun setupCharCounter() {
        binding.etDescription.doOnTextChanged { text, _, _, _ ->
            val charCount = text?.length ?: 0
            binding.root.findViewById<TextView>(R.id.tv_char_count)?.text = "$charCount/200"
        }
    }

    private fun setupFormValidation() {
        val textChangedAction = { _: CharSequence?, _: Int, _: Int, _: Int ->
            binding.btnReportCase.isEnabled = validateForm()
        }

        binding.actvAssaultType.doOnTextChanged(textChangedAction)
        binding.actvLocation.doOnTextChanged(textChangedAction)
        binding.etDescription.doOnTextChanged(textChangedAction)
        binding.actvVictimAge.doOnTextChanged(textChangedAction)
        binding.actvEmployment.doOnTextChanged(textChangedAction)
        binding.actvVictimGender.doOnTextChanged(textChangedAction)
        binding.actvVulnerability.doOnTextChanged(textChangedAction)
        binding.actvAssailantCount.doOnTextChanged(textChangedAction)
        binding.actvAssailantGender.doOnTextChanged(textChangedAction)
        binding.actvAssailantAge.doOnTextChanged(textChangedAction)
        binding.cbDeclaration.setOnCheckedChangeListener { _, _ ->
            binding.btnReportCase.isEnabled = validateForm()
        }
    }

    private fun validateForm(): Boolean {
        val isSelfReporting = binding.actvReporter.text.toString().equals("Self", ignoreCase = true)

        val victimDetailsValid = if (isSelfReporting) {
            true // Victim details are not required for Self
        } else {
            !binding.actvVictimAge.text.isNullOrEmpty() &&
                    !binding.actvEmployment.text.isNullOrEmpty() &&
                    !binding.actvVictimGender.text.isNullOrEmpty() &&
                    !binding.actvVulnerability.text.isNullOrEmpty()
        }

        return !binding.actvReporter.text.isNullOrEmpty() &&
                !binding.actvAssaultType.text.isNullOrEmpty() &&
                !binding.etDescription.text.isNullOrEmpty() &&
                victimDetailsValid &&
                !binding.actvAssailantCount.text.isNullOrEmpty() &&
                !binding.actvAssailantGender.text.isNullOrEmpty() &&
                !binding.actvAssailantAge.text.isNullOrEmpty() &&
                binding.cbDeclaration.isChecked
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uiState.collect {
                when (it) {
                    is CaseReportUiState.Loading -> {
                        binding.btnReportCase.isEnabled = false
                    }
                    is CaseReportUiState.DropdownsLoaded -> {
                        setupDropdowns(it.dropdowns)
                    }
                    is CaseReportUiState.CaseReported -> {
                        showCaseReportedDialog()
                    }
                    is CaseReportUiState.Error -> {
                        Log.e("CaseReportFragment", "Error: ${it.message}", it.error)
                        Toast.makeText(requireContext(), it.message, Toast.LENGTH_SHORT).show()
                        binding.btnReportCase.isEnabled = validateForm()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun showCaseReportedDialog() {
        val dialogBinding = DialogCaseReportedBinding.inflate(layoutInflater)
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