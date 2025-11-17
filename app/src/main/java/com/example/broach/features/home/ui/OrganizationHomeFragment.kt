package com.example.broach.features.home.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.databinding.FragmentOrganizationHomeBinding
import com.example.broach.features.home.ui.data.OrganizationHistoryAdapter
import com.example.broach.features.profile.ui.OrganizationProfileActivity

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

        val name = arguments?.getString(ARG_NAME)
        val imageUrl = arguments?.getString(ARG_IMAGE_URL)

        setupReceivedCasesRecyclerView()
        setupServiceHistoryRecyclerView()

        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_profile -> {
                    val intent = Intent(activity, OrganizationProfileActivity::class.java).apply {
                        putExtra("USER_NAME", name)
                        putExtra("USER_IMAGE_URL", imageUrl)
                    }
                    startActivity(intent)
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

    companion object {
        private const val ARG_NAME = "USER_NAME"
        private const val ARG_IMAGE_URL = "USER_IMAGE_URL"

        fun newInstance(name: String?, imageUrl: String?): OrganizationHomeFragment {
            val fragment = OrganizationHomeFragment()
            val args = Bundle()
            args.putString(ARG_NAME, name)
            args.putString(ARG_IMAGE_URL, imageUrl)
            fragment.arguments = args
            return fragment
        }
    }
}