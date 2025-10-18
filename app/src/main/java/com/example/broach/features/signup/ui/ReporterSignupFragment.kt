package com.example.broach.features.signup.ui

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.widget.addTextChangedListener
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.broach.core.validation.SignupValidationResult
import com.example.broach.core.validation.SignupValidator
import com.example.broach.databinding.FragmentReporterSignupBinding
import com.example.broach.features.login.ui.LoginActivity
import com.example.broach.features.signup.data.SignupRepository
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient
import kotlinx.coroutines.launch

class ReporterSignupFragment : Fragment() {

    private var _binding: FragmentReporterSignupBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SignupViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(SignupViewModel::class.java)) {
                    val apiService = RetrofitClient.createService(ApiService::class.java)
                    val repository = SignupRepository(apiService)
                    @Suppress("UNCHECKED_CAST")
                    return SignupViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class")
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReporterSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tilFullName.editText?.addTextChangedListener {
            viewModel.fullName.value = it.toString()
        }
        binding.tilEmail.editText?.addTextChangedListener {
            viewModel.email.value = it.toString()
        }
        binding.tilPhone.editText?.addTextChangedListener {
            viewModel.phone.value = it.toString()
        }
        binding.tilPassword.editText?.addTextChangedListener {
            viewModel.password.value = it.toString()
        }
        binding.tilConfirmPassword.editText?.addTextChangedListener {
            viewModel.confirmPassword.value = it.toString()
        }

        binding.txSignIn.setOnClickListener {
            val intent = Intent(requireActivity(), LoginActivity::class.java)
            startActivity(intent)
        }

        binding.btnSignUp.setOnClickListener {
            if (isInputValid()) {
                viewModel.onSignupClicked(false) // `false` for reporter
            }
        }

        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is SignupUiState.Idle -> { /* Do nothing */
                    }

                    is SignupUiState.Loading -> {
                        binding.btnSignUp.isEnabled = false
                        Toast.makeText(requireContext(), "Signing up...", Toast.LENGTH_SHORT).show()
                    }

                    is SignupUiState.Success -> {
                        binding.btnSignUp.isEnabled = true
                        Toast.makeText(requireContext(), "Signup Successful", Toast.LENGTH_LONG).show()
                        val intent = Intent(requireActivity(), LoginActivity::class.java)
                        startActivity(intent)
                        requireActivity().finish()
                    }

                    is SignupUiState.Error -> {
                        binding.btnSignUp.isEnabled = true
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // Validation logic for the reporter form
    private fun isInputValid(): Boolean {
        val fullName = binding.tilFullName.editText?.text.toString()
        val email = binding.tilEmail.editText?.text.toString()
        val phone = binding.tilPhone.editText?.text.toString()
        val password = binding.tilPassword.editText?.text.toString()
        val confirmPassword = binding.tilConfirmPassword.editText?.text.toString()

        when (val result = SignupValidator.validateReporterSignup(
            fullName,
            email,
            phone,
            password,
            confirmPassword
        )) {
            is SignupValidationResult.Success -> {
                // All inputs are valid
                return true
            }

            is SignupValidationResult.Failure -> {
                // An input is invalid, display a toast with the error message
                Toast.makeText(requireContext(), result.message, Toast.LENGTH_LONG).show()
                return false
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
