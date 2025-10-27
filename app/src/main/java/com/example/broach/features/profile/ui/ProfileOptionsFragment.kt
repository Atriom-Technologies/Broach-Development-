package com.example.broach.features.profile.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.broach.databinding.FragmentProfileOptionsBinding
import com.example.broach.features.logout.ui.LogoutActivity
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class ProfileOptionsFragment : BottomSheetDialogFragment() {

    private var _binding: FragmentProfileOptionsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileOptionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Set click listeners for the options
        binding.tvSubscription.setOnClickListener { /* Handle subscription click */ }
        binding.tvWallet.setOnClickListener { /* Handle wallet click */ }
        binding.tvSupport.setOnClickListener { /* Handle support click */ }
        binding.tvFaqs.setOnClickListener { /* Handle FAQs click */ }
        binding.tvSettings.setOnClickListener { /* Handle settings click */ }
        binding.tvReportProblem.setOnClickListener { /* Handle report problem click */ }
        
        binding.tvLogout.setOnClickListener { 
            val intent = Intent(activity, LogoutActivity::class.java)
            startActivity(intent)
        }

        // Close the bottom sheet when the close button is clicked
        binding.btnClose.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}