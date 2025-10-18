package com.example.broach.features.login.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.broach.R
import com.example.broach.databinding.FragmentForgotPasswordBinding

class ForgotPasswordFragment : Fragment() {

    private var _binding: FragmentForgotPasswordBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentForgotPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // TextWatcher to validate email input and enable/disable button
        binding.tilEmail.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val email = s.toString()
                binding.btnRequestResetLink.isEnabled = Patterns.EMAIL_ADDRESS.matcher(email).matches()
            }
        })

        binding.btnRequestResetLink.setOnClickListener {
            val email = binding.tilEmail.editText?.text.toString()

            Toast.makeText(requireContext(), "A reset link has been sent to $email", Toast.LENGTH_LONG).show()

            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, UpdatePasswordFragment())
                .addToBackStack(null)
                .commit()
        }

        binding.btnBackToLogin.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}