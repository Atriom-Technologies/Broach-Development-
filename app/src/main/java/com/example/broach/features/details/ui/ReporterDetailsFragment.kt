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
import com.example.broach.databinding.FragmentPersonalDetailsBinding
import com.example.broach.features.home.ui.HomeActivity
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class ReporterDetailsFragment : Fragment() {

    private var _binding: FragmentPersonalDetailsBinding? = null
    private val binding get() = _binding!!

    private lateinit var loadingDialog: Dialog
    private lateinit var sessionManager: SessionManager
    private var photoUri: Uri? = null
    private var selectedGender: String? = null

    private val viewModel: DetailsViewModel by viewModels {
        ViewModelFactory(requireContext())
    }

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            data?.data?.let {
                photoUri = it
                binding.btnImage.setImageURI(it)
                validateFields()
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

        sessionManager = SessionManager(requireContext())

        setupLoadingDialog()
        observeViewModel()
        setupTextWatchers()
        setupGenderSelection()
        setupDatePicker()
        setupPhotoUpload()

        binding.btnContinue.setOnClickListener {
            val occupation = binding.etOccupation.text.toString().trim()
            val dob = binding.etDob.getTag(R.id.server_date) as? String ?: ""
            val userId = sessionManager.getUserId()

            if (userId != null && selectedGender != null && photoUri != null) {
                val imagePart = uriToMultipart(photoUri!!)
                viewModel.submitReporterDetails(
                    userId = userId,
                    gender = selectedGender!!,
                    dateOfBirth = dob,
                    occupation = occupation,
                    image = imagePart
                )
            }
        }

        validateFields() // Initial validation check
    }

    private fun setupGenderSelection() {
        binding.btnMale.setOnClickListener {
            selectedGender = "Male"
            binding.btnMale.isSelected = true
            binding.btnFemale.isSelected = false
            updateGenderButtons()
            validateFields()
        }

        binding.btnFemale.setOnClickListener {
            selectedGender = "Female"
            binding.btnFemale.isSelected = true
            binding.btnMale.isSelected = false
            updateGenderButtons()
            validateFields()
        }
    }

    private fun updateGenderButtons() {
        binding.btnMale.setBackgroundColor(if (binding.btnMale.isSelected) requireContext().getColor(R.color.primary_color2) else requireContext().getColor(R.color.light_gray))
        binding.btnFemale.setBackgroundColor(if (binding.btnFemale.isSelected) requireContext().getColor(R.color.primary_color2) else requireContext().getColor(R.color.light_gray))
    }

    private fun setupDatePicker() {
        val calendar = Calendar.getInstance()
        binding.etDob.setOnClickListener {
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            DatePickerDialog(requireContext(), { _, selectedYear, selectedMonth, selectedDay ->
                val selectedCalendar = Calendar.getInstance().apply {
                    set(selectedYear, selectedMonth, selectedDay)
                }
                val uiSdf = SimpleDateFormat("dd/MM/yyyy", Locale.US)
                binding.etDob.setText(uiSdf.format(selectedCalendar.time))

                val serverSdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                binding.etDob.setTag(R.id.server_date, serverSdf.format(selectedCalendar.time))
                validateFields()
            }, year, month, day).show()
        }
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                validateFields()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        }
        binding.etOccupation.addTextChangedListener(textWatcher)
    }

    private fun setupPhotoUpload() {
        binding.btnUploadPhoto.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            pickImageLauncher.launch(intent)
        }
    }

    private fun uriToMultipart(uri: Uri): MultipartBody.Part {
        val inputStream: InputStream? = requireContext().contentResolver.openInputStream(uri)
        
        var mimeType = requireContext().contentResolver.getType(uri)
        if (mimeType == null) {
            val fileExtension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
            mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtension.lowercase())
        }

        val requestBody = inputStream!!.readBytes().toRequestBody(mimeType?.toMediaTypeOrNull())
        return MultipartBody.Part.createFormData("profilePicture", "photo.jpg", requestBody)
    }

    private fun validateFields() {
        val occupation = binding.etOccupation.text.toString().trim()
        val dob = binding.etDob.text.toString().trim()

        val isGenderSelected = selectedGender != null
        val isOccupationValid = occupation.isNotEmpty()
        val isDobValid = dob.isNotEmpty()
        val isPhotoUploaded = photoUri != null

        val allFieldsValid = isGenderSelected && isOccupationValid && isDobValid && isPhotoUploaded

        binding.btnContinue.isEnabled = allFieldsValid
        if (allFieldsValid) {
            binding.btnContinue.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.primary_color2)
        } else {
            binding.btnContinue.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.light_gray)
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is DetailsUiState.Idle -> {
                        hideLoadingDialog()
                        validateFields()
                    }
                    is DetailsUiState.Submitting -> {
                        showLoadingDialog()
                        binding.btnContinue.isEnabled = false
                    }
                    is DetailsUiState.Success -> {
                        hideLoadingDialog()
                        val userRole = requireActivity().intent.getStringExtra("USER_ROLE")

                        val intent = Intent(activity, HomeActivity::class.java).apply {
                            putExtra("USER_ROLE", userRole)
                            putExtra("USER_NAME", state.response.name)
                            putExtra("USER_IMAGE_URL", state.response.imageUrl)
                        }
                        startActivity(intent)
                        activity?.finish()
                    }
                    is DetailsUiState.Error -> {
                        hideLoadingDialog()
                        validateFields()
                        showErrorDialog(state.message)
                    }
                }
            }
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

    private fun showErrorDialog(message: String) {
        AlertDialog.Builder(requireContext())
            .setTitle("Submission Failed")
            .setMessage("An error occurred during submission:$message")
            .setPositiveButton("OK", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
