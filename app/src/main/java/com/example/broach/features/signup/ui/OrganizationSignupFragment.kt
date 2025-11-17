package com.example.broach.features.signup.ui

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Patterns
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.broach.R
import com.example.broach.common.SessionManager
import com.example.broach.databinding.FragmentOrganizationSignupBinding
import com.example.broach.features.details.ui.DetailsActivity
import com.example.broach.features.login.ui.LoginActivity
import com.example.broach.features.signup.data.SignupRepository
import com.example.broach.network.ApiService
import com.example.broach.network.OrganizationSignupRequest
import com.example.broach.network.RetrofitClient
import kotlinx.coroutines.launch

class OrganizationSignupFragment : Fragment() {

    private var _binding: FragmentOrganizationSignupBinding? = null
    private val binding get() = _binding!!

    private lateinit var loadingDialog: Dialog

    private val viewModel: SignupViewModel by viewModels {
        SignupViewModelFactory(SignupRepository(RetrofitClient.createService(ApiService::class.java)))
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupLoadingDialog()
        setupTextWatchers()
        observeViewModel()

        binding.txSignIn.setOnClickListener {
            val intent = Intent(activity, LoginActivity::class.java)
            startActivity(intent)
        }

        binding.btnSignUp.setOnClickListener {
            val orgName = binding.etOrgName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val phone = binding.etPhone.text.toString().trim()
            val password = binding.etPassword.editText?.text.toString().trim()
            val confirmPassword = binding.etConfirmPassword.editText?.text.toString().trim()

            val request = OrganizationSignupRequest(
                organizationName = orgName,
                email = email,
                phone = phone,
                password = password,
                confirmPassword = confirmPassword
            )
            viewModel.signupOrganization(request)
        }

        validateFields()
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is SignupUiState.Idle -> {
                        hideLoadingDialog()
                        validateFields()
                    }
                    is SignupUiState.Loading -> {
                        showLoadingDialog()
                    }
                    is SignupUiState.Success -> {
                        hideLoadingDialog()
                        val response = state.response
                        SessionManager.saveUserId(requireContext(), response.userId)
                        response.authToken?.let { SessionManager.saveAuthToken(requireContext(), it) }

                        if (response.userType?.trim() == "support_organization") {
                            val intent = Intent(activity, DetailsActivity::class.java).apply {
                                putExtra("USER_ROLE", "Support Organization")
                            }
                            startActivity(intent)
                            activity?.finish()
                        } else {
                            Toast.makeText(requireContext(), "Signup failed: Invalid user role from server.", Toast.LENGTH_LONG).show()
                        }
                    }
                    is SignupUiState.Error -> {
                        hideLoadingDialog()
                        Toast.makeText(requireContext(), "Signup failed: ${state.message}", Toast.LENGTH_LONG).show()
                        validateFields()
                    }
                }
            }
        }
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateFields()
            }
        }

        binding.etOrgName.addTextChangedListener(textWatcher)
        binding.etEmail.addTextChangedListener(textWatcher)
        binding.etPhone.addTextChangedListener(textWatcher)
        binding.etPassword.editText?.addTextChangedListener(textWatcher)
        binding.etConfirmPassword.editText?.addTextChangedListener(textWatcher)
    }

    private fun validateFields() {
        if (viewModel.uiState.value is SignupUiState.Loading) return

        val orgName = binding.etOrgName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val phone = binding.etPhone.text.toString().trim()
        val password = binding.etPassword.editText?.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.editText?.text.toString().trim()

        val isOrgNameValid = orgName.isNotEmpty()
        val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()
        val isPhoneValid = phone.length >= 10
        val isPasswordValid = password.length >= 6
        val doPasswordsMatch = password == confirmPassword && password.isNotEmpty()

        val allFieldsValid = isOrgNameValid && isEmailValid && isPhoneValid && isPasswordValid && doPasswordsMatch

        binding.btnSignUp.isEnabled = allFieldsValid
        if (allFieldsValid) {
            binding.btnSignUp.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.primary_color2)
        } else {
            binding.btnSignUp.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.light_gray)
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
                text = "Signing up..."
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
