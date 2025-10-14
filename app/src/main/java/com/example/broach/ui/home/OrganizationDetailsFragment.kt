package com.example.broach.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.broach.databinding.FragmentOrganizationDetailsBinding

class OrganizationDetailsFragment : Fragment() {

    private var _binding: FragmentOrganizationDetailsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationDetailsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // Set up logic for this fragment, e.g., button listeners, data input handling.
        binding.btnContinue.setOnClickListener {
            // Logic to handle "Continue to Home" button click
            // e.g., collect data, make API call, and navigate to main screen
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}