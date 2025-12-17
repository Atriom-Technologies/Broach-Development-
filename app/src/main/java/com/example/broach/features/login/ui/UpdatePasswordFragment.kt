package com.example.broach.features.login.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.FragmentUpdatePasswordBinding
import kotlinx.coroutines.launch

class UpdatePasswordFragment : Fragment() {

    private var _binding: FragmentUpdatePasswordBinding? = null
    private val binding get() = _binding!!

    private val viewModel: UpdatePasswordViewModel by viewModels { ViewModelFactory(requireContext()) }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUpdatePasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        observeUiState()

        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val newPassword = binding.tilNewPassword.editText?.text.toString()
                val confirmPassword = binding.tilConfirmPassword.editText?.text.toString()

                val isPasswordValid = newPassword.length >= 8 && newPassword == confirmPassword
                binding.btnSaveAndLogin.isEnabled = isPasswordValid
            }
        }

        binding.tilNewPassword.editText?.addTextChangedListener(textWatcher)
        binding.tilConfirmPassword.editText?.addTextChangedListener(textWatcher)

        binding.btnSaveAndLogin.setOnClickListener {
            val newPassword = binding.tilNewPassword.editText?.text.toString()
            // TODO: Get the actual token from the email link/previous fragment
            val token = "dummy-token" 
            viewModel.resetPassword(newPassword, token)
        }
    }

    private fun observeUiState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is UpdatePasswordUiState.Loading -> {
                        binding.btnSaveAndLogin.isEnabled = false
                    }
                    is UpdatePasswordUiState.Success -> {
                        Toast.makeText(requireContext(), "Password updated successfully!", Toast.LENGTH_SHORT).show()
                        parentFragmentManager.popBackStack()
                    }
                    is UpdatePasswordUiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        binding.btnSaveAndLogin.isEnabled = true
                    }
                    else -> { /* Idle */ }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}