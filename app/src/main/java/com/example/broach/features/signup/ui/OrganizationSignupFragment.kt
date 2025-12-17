package com.example.broach.features.signup.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.example.broach.common.SessionManager
import com.example.broach.common.ViewModelFactory
import com.example.broach.databinding.FragmentOrganizationSignupBinding
import com.example.broach.features.details.ui.OrganizationDetailsFragment
import com.example.broach.features.login.ui.LoginActivity
import kotlinx.coroutines.launch

class OrganizationSignupFragment : Fragment() {

    private var _binding: FragmentOrganizationSignupBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SignupViewModel by viewModels { ViewModelFactory(requireContext()) }
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        binding.btnSignUp.setOnClickListener {
            val name = binding.etOrgName.text.toString()
            val email = binding.etEmail.text.toString()
            val password = binding.etPassword.editText?.text.toString()

            viewModel.signup(
                name = name,
                email = email,
                password = password,
                userType = "ORGANIZATION"
            )
        }

        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is SignupUiState.Loading -> {
                        binding.btnSignUp.isEnabled = false
                    }
                    is SignupUiState.Success -> {
                        sessionManager.saveUserId(state.userId)
                        sessionManager.saveAuthToken(state.authToken)

                        val intent = Intent(requireActivity(), OrganizationDetailsFragment::class.java).apply {
                            putExtra("USER_ROLE", "ORGANIZATION")
                        }
                        startActivity(intent)
                        requireActivity().finish()
                    }
                    is SignupUiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        binding.btnSignUp.isEnabled = true
                    }
                    else -> {}
                }
            }
        }

        binding.txSignIn.setOnClickListener {
            startActivity(Intent(requireActivity(), LoginActivity::class.java))
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}