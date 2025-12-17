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
import com.example.broach.databinding.FragmentOrganizationHomeBinding
import com.example.broach.features.home.ui.data.OrganizationHistoryAdapter
import com.example.broach.features.profile.ui.OrganizationProfileActivity

class OrganizationHomeFragment : Fragment() {

    private var _binding: FragmentOrganizationHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationHomeBinding.inflate(inflater, container, false)
        sessionManager = SessionManager(requireContext())
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Get user data from SessionManager
        val name = sessionManager.getUserName()
        val imageUrl = sessionManager.getUserImageUrl()

        setupReceivedCasesRecyclerView()
        setupServiceHistoryRecyclerView()

        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_profile -> {
                    val intent = Intent(activity, OrganizationProfileActivity::class.java)
                    startActivity(intent)
                    true
                }
                R.id.nav_notifications -> {
                    findNavController().navigate(R.id.action_organizationHomeFragment_to_organizationNotificationsFragment)
                    true
                }
                else -> false
            }
        }

        // Populate header details
        binding.tvGreeting.text = "Hi, $name!"
        Glide.with(this)
            .load(imageUrl)
            .placeholder(R.drawable.ic_person2)
            .circleCrop()
            .into(binding.ivProfile)
    }

    private fun setupReceivedCasesRecyclerView() {
        // Dummy data for now
        val adapter = OrganizationHistoryAdapter(emptyList())
        binding.rvCasesHistory.layoutManager = LinearLayoutManager(context)
        binding.rvCasesHistory.adapter = adapter
    }

    private fun setupServiceHistoryRecyclerView() {
        // Dummy data for now
        val adapter = OrganizationHistoryAdapter(emptyList())
        binding.rvServicesHistory.layoutManager = LinearLayoutManager(context)
        binding.rvServicesHistory.adapter = adapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}