package com.example.broach.features.home.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.broach.databinding.FragmentOrganizationHomeBinding
import com.example.broach.features.home.ui.data.OrganizationHistoryAdapter
import com.example.broach.features.home.ui.data.OrganizationHistoryItem

class OrganizationHomeFragment : Fragment() {

    private var _binding: FragmentOrganizationHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupReceivedCasesRecyclerView()
        setupServiceHistoryRecyclerView()

        // Handle button clicks
        binding.btnViewAllCases.setOnClickListener {
            // TODO: Navigate to the full list of received cases
        }

        binding.btnViewAllServices.setOnClickListener {
            // TODO: Navigate to the full list of offered services
        }

        // Populate header details
        binding.tvGreeting.text = "Hi Charity Heart Foundation!" // Replace with actual organization name
    }

    private fun setupReceivedCasesRecyclerView() {
        val dummyCaseData = listOf(
            OrganizationHistoryItem("16-06-2024", "18:45", "Franklin Udeh", "Gender Based Violence", true),
            OrganizationHistoryItem("15-06-2024", "10:30", "Jane Doe", "Mental Health Support", true)
        )

        val adapter = OrganizationHistoryAdapter(dummyCaseData)
        binding.rvCasesHistory.layoutManager = LinearLayoutManager(context)
        binding.rvCasesHistory.adapter = adapter
    }

    private fun setupServiceHistoryRecyclerView() {
        val dummyServiceData = listOf(
            OrganizationHistoryItem(
                "22-11-2024",
                "08:07",
                "Blue Flower Support Services",
                "Welfare services",
                false
            ),
        )

        val adapter = OrganizationHistoryAdapter(dummyServiceData)
        binding.rvServicesHistory.layoutManager = LinearLayoutManager(context)
        binding.rvServicesHistory.adapter = adapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}