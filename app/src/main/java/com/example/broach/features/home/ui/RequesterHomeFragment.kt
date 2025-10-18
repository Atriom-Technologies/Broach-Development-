package com.example.broach.features.home.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.broach.databinding.FragmentRequesterHomeBinding
import com.example.broach.features.home.ui.data.CaseHistoryAdapter
import com.example.broach.features.home.ui.data.CaseHistoryItem

class RequesterHomeFragment : Fragment() {

    private var _binding: FragmentRequesterHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRequesterHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupCaseHistoryRecyclerView()
        setupServiceHistoryRecyclerView()

        // Handle button clicks (e.g., Report a Case)
        binding.btnReportCase.setOnClickListener {
            // TODO: Navigate to the Report Case screen
        }

        binding.btnRequestService.setOnClickListener {
            // TODO: Navigate to the Request Service screen
        }

        // Populate header details
        binding.tvGreeting.text = "" // Replace with actual user name
    }

    private fun setupCaseHistoryRecyclerView() {
        val dummyCaseData = listOf(
            CaseHistoryItem("16-06-2024", "18:45", "Charity Heart Foundation", "Gender Based Violence", true),
        )

        val adapter = CaseHistoryAdapter(dummyCaseData)
        binding.rvCaseHistory.layoutManager = LinearLayoutManager(context)
        binding.rvCaseHistory.adapter = adapter
    }

    private fun setupServiceHistoryRecyclerView() {
        val dummyServiceData = listOf(
            CaseHistoryItem(
                "22-11-2024",
                "08:07",
                "Blue Flower Support Services",
                "Welfare services",
                false
            ),
        )

        // Using the same adapter for simplicity, customize if needed
        val adapter = CaseHistoryAdapter(dummyServiceData)
        binding.rvServiceHistory.layoutManager = LinearLayoutManager(context)
        binding.rvServiceHistory.adapter = adapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}