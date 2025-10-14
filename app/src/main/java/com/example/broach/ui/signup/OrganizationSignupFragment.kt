package com.example.broach.ui.signup
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.broach.data.SignupValidationResult
import com.example.broach.data.SignupValidator
import com.example.broach.data.createWatcher
import com.example.broach.databinding.FragmentOrganizationSignupBinding
import com.example.broach.ui.login.LoginActivity
import kotlinx.coroutines.launch
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient

class OrganizationSignupFragment : Fragment() {

    private var _binding: FragmentOrganizationSignupBinding? = null
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
        _binding = FragmentOrganizationSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tilFullName.editText?.addTextChangedListener(createWatcher { text ->
            viewModel.fullName.value = text
        })
        binding.tilEmail.editText?.addTextChangedListener(createWatcher { text ->
            viewModel.email.value = text
        })
        binding.tilPhone.editText?.addTextChangedListener(createWatcher { text ->
            viewModel.phone.value = text
        })
        binding.tilPassword.editText?.addTextChangedListener(createWatcher { text ->
            viewModel.password.value = text
        })
        binding.tilConfirmPassword.editText?.addTextChangedListener(createWatcher { text ->
            viewModel.confirmPassword.value = text
        })

        binding.txSignIn.setOnClickListener {
            val intent = Intent(requireActivity(), LoginActivity::class.java)
            startActivity(intent)
        }

        binding.btnSignUp.setOnClickListener {
            if (isInputValid()) {
                viewModel.onSignupClicked(true) // `true` for organization
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
                        Toast.makeText(requireContext(), "Signup Successful", Toast.LENGTH_LONG)
                            .show()
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

    // Validation logic for the organization form
    private fun isInputValid(): Boolean {
        val organizationName = binding.tilFullName.editText?.text.toString()
        val email = binding.tilEmail.editText?.text.toString()
        val phone = binding.tilPhone.editText?.text.toString()
        val password = binding.tilPassword.editText?.text.toString()
        val confirmPassword = binding.tilConfirmPassword.editText?.text.toString()

        when (val result = SignupValidator.validateOrganizationSignup(
            organizationName,
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

    private fun createWatcher(onTextChanged: (String) -> Unit): TextWatcher {
        return object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) { onTextChanged(s.toString()) }
            override fun afterTextChanged(s: Editable?) {}
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}


