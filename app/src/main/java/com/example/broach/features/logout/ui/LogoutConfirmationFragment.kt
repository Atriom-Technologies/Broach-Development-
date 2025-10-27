package com.example.broach.features.logout.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.broach.R
import com.example.broach.databinding.FragmentLogoutConfirmationBinding

class LogoutConfirmationFragment : Fragment() {

    private var _binding: FragmentLogoutConfirmationBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLogoutConfirmationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnCancelLogout.setOnClickListener {
            activity?.finish() // Close the LogoutActivity
        }

        binding.btnConfirmLogout.setOnClickListener {
            // Replace with LogoutSuccessFragment
            parentFragmentManager.beginTransaction()
                .replace(R.id.logout_fragment_container, LogoutSuccessFragment())
                .commit()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}