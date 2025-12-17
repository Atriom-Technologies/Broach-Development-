package com.example.broach.features.home.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.common.SessionManager
import com.example.broach.databinding.FragmentRequesterHomeBinding
import com.example.broach.features.home.ui.data.CaseHistoryAdapter
import com.example.broach.features.profile.ui.ProfileActivity
import java.util.Locale

class RequesterHomeFragment : Fragment() {

    private var _binding: FragmentRequesterHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRequesterHomeBinding.inflate(inflater, container, false)
        sessionManager = SessionManager(requireContext())
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Get user data from SessionManager
        val name = sessionManager.getUserName()
        val imageUrl = sessionManager.getUserImageUrl()

        setupCaseHistoryRecyclerView()
        setupServiceHistoryRecyclerView()

        binding.btnReportCase.setOnClickListener {
            findNavController().navigate(R.id.action_requesterHomeFragment_to_caseReportFragment)
        }

        binding.btnRequestService.setOnClickListener {
            findNavController().navigate(R.id.action_requesterHomeFragment_to_serviceRequestFragment)
        }

        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_profile -> {
                    val intent = Intent(activity, ProfileActivity::class.java)
                    startActivity(intent)
                    true
                }
                R.id.nav_notifications -> {
                    findNavController().navigate(R.id.action_requesterHomeFragment_to_notificationsFragment)
                    true
                }
                else -> false
            }
        }

        // Populate header details
        binding.tvGreeting.text = "Hello, ${capitalizeWords(name)}"
        Glide.with(this)
            .load(imageUrl)
            .placeholder(R.drawable.ic_person)
            .circleCrop()
            .into(binding.ivProfile)
    }

    private fun setupCaseHistoryRecyclerView() {
        // Dummy data for now
        val adapter = CaseHistoryAdapter(emptyList())
        binding.rvCaseHistory.layoutManager = LinearLayoutManager(context)
        binding.rvCaseHistory.adapter = adapter
    }

    private fun setupServiceHistoryRecyclerView() {
        // Dummy data for now
        val adapter = CaseHistoryAdapter(emptyList())
        binding.rvServiceHistory.layoutManager = LinearLayoutManager(context)
        binding.rvServiceHistory.adapter = adapter
    }

    private fun capitalizeWords(name: String?): String {
        return name?.split(' ')?.joinToString(" ") { 
            it.replaceFirstChar { char -> 
                if (char.isLowerCase()) char.titlecase(Locale.getDefault()) else char.toString() 
            }
        } ?: ""
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}