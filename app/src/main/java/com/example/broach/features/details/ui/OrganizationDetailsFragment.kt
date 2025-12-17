package com.example.broach.features.details.ui

import android.app.Activity
import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.broach.R
import com.example.broach.common.SessionManager
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.FragmentOrganizationDetailsBinding
import com.example.broach.features.home.ui.HomeActivity
import com.example.broach.network.Sector
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class OrganizationDetailsFragment : Fragment() {

    private var _binding: FragmentOrganizationDetailsBinding? = null
    private val binding get() = _binding!!

    private lateinit var loadingDialog: Dialog
    private lateinit var sessionManager: SessionManager // Correctly instantiated
    private var logoUri: Uri? = null
    private var sectors: List<Sector> = emptyList()

    private val viewModel: DetailsViewModel by viewModels { ViewModelFactory(requireContext()) }

    private val orgSizeMap = mapOf(
        "5-10" to "size_5_10",
        "10-20" to "size_10_20",
        "20-50" to "size_20_50",
        "50+" to "size_50_plus"
    )

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            data?.data?.let {
                logoUri = it
                binding.btnImage.setImageURI(it)
                validateFields()
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

        sessionManager = SessionManager(requireContext()) // Instantiate SessionManager

        setupLoadingDialog()
        setupTextWatchers()
        setupOrgSizeDropdown()
        setupDatePicker()
        setupLogoUpload()
        observeViewModel()
        observeSectors()

        binding.btnContinue.setOnClickListener {
            val dateEstablished = binding.etDateEstablished.getTag(R.id.server_date) as? String ?: ""
            val orgSizeDisplay = binding.tvOrgSize.text.toString()
            val orgSizeServer = orgSizeMap[orgSizeDisplay]
            val address = binding.etAddress.text.toString()
            val altContact = binding.etAltContact.text.toString()
            val selectedSectorName = binding.tvSector.text.toString()

            val selectedSector = sectors.find { it.name == selectedSectorName }
            val userId = sessionManager.getUserId() // Use instance to get userId

            if (userId != null && orgSizeServer != null && selectedSector != null && logoUri != null) {
                val logoPart = uriToMultipart(logoUri!!)
                viewModel.submitOrganizationDetails(
                    userId = userId,
                    sectorId = selectedSector.id,
                    dateEstablished = dateEstablished,
                    organizationSize = orgSizeServer,
                    address = address,
                    alternatePhone = altContact,
                    logo = logoPart
                )
            }
        }

        validateFields() // Initial validation check
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is DetailsUiState.Idle -> {
                        hideLoadingDialog()
                        binding.btnContinue.isEnabled = true
                    }
                    is DetailsUiState.Submitting -> {
                        showLoadingDialog()
                        binding.btnContinue.isEnabled = false
                    }
                    is DetailsUiState.Success -> {
                        hideLoadingDialog()
                        val userRole = requireActivity().intent.getStringExtra("USER_ROLE")

                        val intent = Intent(requireActivity(), HomeActivity::class.java).apply {
                            putExtra("USER_ROLE", userRole)
                            putExtra("USER_NAME", state.response.name)
                            putExtra("USER_IMAGE_URL", state.response.imageUrl)
                        }
                        startActivity(intent)
                        activity?.finish()
                    }
                    is DetailsUiState.Error -> {
                        hideLoadingDialog()
                        binding.btnContinue.isEnabled = true
                        showErrorDialog("Submission Failed", state.message)
                    }
                }
            }
        }
    }

    private fun observeSectors() {
        lifecycleScope.launch {
            viewModel.sectorState.collect { state ->
                when (state) {
                    is SectorUiState.Loading -> {
                        // Optional: Show a loading indicator for the dropdown
                    }
                    is SectorUiState.Success -> {
                        sectors = state.sectors
                        val sectorNames = sectors.map { it.name }
                        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, sectorNames)
                        binding.tvSector.setAdapter(adapter)
                    }
                    is SectorUiState.Error -> {
                        showErrorDialog("Failed to Load Sectors", state.message)
                    }
                }
            }
        }
    }

    private fun showErrorDialog(title: String, message: String) {
        AlertDialog.Builder(requireContext())
            .setTitle(title)
            .setMessage("An error occurred: $message")
            .setPositiveButton("OK", null)
            .show()
    }

    private fun uriToMultipart(uri: Uri): MultipartBody.Part {
        val inputStream: InputStream? = requireContext().contentResolver.openInputStream(uri)
        val mimeType = requireContext().contentResolver.getType(uri)
        val requestBody = inputStream!!.readBytes().toRequestBody(mimeType?.toMediaTypeOrNull())
        return MultipartBody.Part.createFormData("organizationLogo", "logo.jpg", requestBody)
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                validateFields()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        }
        binding.tvSector.addTextChangedListener(textWatcher)
        binding.tvOrgSize.addTextChangedListener(textWatcher)
        binding.etAddress.addTextChangedListener(textWatcher)
        binding.etAltContact.addTextChangedListener(textWatcher)
    }

    private fun setupOrgSizeDropdown() {
        val sizes = orgSizeMap.keys.toTypedArray()
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, sizes)
        binding.tvOrgSize.setAdapter(adapter)
    }

    private fun setupDatePicker() {
        val calendar = Calendar.getInstance()
        binding.etDateEstablished.setOnClickListener {
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            DatePickerDialog(requireContext(), { _, selectedYear, selectedMonth, selectedDay ->
                val selectedCalendar = Calendar.getInstance().apply {
                    set(selectedYear, selectedMonth, selectedDay)
                }
                val uiSdf = SimpleDateFormat("dd/MM/yyyy", Locale.US)
                binding.etDateEstablished.setText(uiSdf.format(selectedCalendar.time))

                val serverSdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                binding.etDateEstablished.setTag(R.id.server_date, serverSdf.format(selectedCalendar.time))
                validateFields()
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

    private fun validateFields() {
        val sector = binding.tvSector.text.toString()
        val dateEstablished = binding.etDateEstablished.text.toString()
        val orgSize = binding.tvOrgSize.text.toString()
        val address = binding.etAddress.text.toString().trim()
        val altContact = binding.etAltContact.text.toString().trim()

        val isSectorValid = sector.isNotEmpty()
        val isDateValid = dateEstablished.isNotEmpty()
        val isOrgSizeValid = orgSize.isNotEmpty()
        val isAddressValid = address.isNotEmpty()
        val isAltContactValid = altContact.isNotEmpty()
        val isLogoUploaded = logoUri != null

        val allFieldsValid = isSectorValid && isDateValid && isOrgSizeValid && isAddressValid && isAltContactValid && isLogoUploaded

        binding.btnContinue.isEnabled = allFieldsValid
        if (allFieldsValid) {
            binding.btnContinue.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.primary_color2)
        } else {
            binding.btnContinue.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.light_gray)
        }
    }

    private fun setupLoadingDialog() {
        loadingDialog = Dialog(requireContext())
        loadingDialog.setContentView(LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(50, 50, 50, 50)
            addView(ProgressBar(context))
            addView(TextView(context).apply {
                text = "Submitting..."
                textSize = 18f
                setPadding(20, 0, 0, 0)
            })
        })
        loadingDialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        loadingDialog.setCancelable(false)
        loadingDialog.setCanceledOnTouchOutside(false)
    }

    private fun showLoadingDialog() {
        if (!loadingDialog.isShowing) {
            loadingDialog.show()
        }
    }

    private fun hideLoadingDialog() {
        if (loadingDialog.isShowing) {
            loadingDialog.dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}