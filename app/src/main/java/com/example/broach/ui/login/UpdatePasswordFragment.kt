package com.example.broach.ui.login


import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.broach.databinding.FragmentUpdatePasswordBinding

class UpdatePasswordFragment : Fragment() {

    private var _binding: FragmentUpdatePasswordBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUpdatePasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // TextWatcher to validate password input and enable/disable button
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


            Toast.makeText(requireContext(), "Password updated successfully!", Toast.LENGTH_SHORT).show()


            parentFragmentManager.popBackStack()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
