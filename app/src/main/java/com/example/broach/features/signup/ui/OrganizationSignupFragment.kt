package com.example.broach.features.signup.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.broach.databinding.FragmentOrganizationSignupBinding
import com.example.broach.features.home.ui.OrganizationDetailsFragment

class OrganizationSignupFragment : Fragment() {

    private var _binding: FragmentOrganizationSignupBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnSignUp.setOnClickListener {
            if (isInputValid()) {
                val intent = Intent(requireActivity(), OrganizationDetailsFragment::class.java)
                startActivity(intent)
            }
        }
    }

    private fun isInputValid(): Boolean {
        binding.tilFullName.error = null
        binding.tilEmail.error = null
        binding.tilPhone.error = null
        binding.tilPassword.error = null
        binding.tilConfirmPassword.error = null

        if (binding.etFullName.text.isNullOrEmpty()) {
            binding.tilFullName.error = "Please enter your organization's name"
            return false
        }
        if (binding.etEmail.text.isNullOrEmpty()) {
            binding.tilEmail.error = "Please enter your email address"
            return false
        }
        if (binding.etPhone.text.isNullOrEmpty()) {
            binding.tilPhone.error = "Please enter your phone number"
            return false
        }
        if (binding.etPassword.text.isNullOrEmpty()) {
            binding.tilPassword.error = "Please enter your password"
            return false
        }
        if (binding.etConfirmPassword.text.isNullOrEmpty()) {
            binding.tilConfirmPassword.error = "Please confirm your password"
            return false
        }
        if (binding.etPassword.text.toString() != binding.etConfirmPassword.text.toString()) {
            binding.tilConfirmPassword.error = "Passwords do not match"
            return false
        }
        return true
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
