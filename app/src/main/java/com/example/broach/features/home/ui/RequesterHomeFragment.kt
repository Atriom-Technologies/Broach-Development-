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
import com.example.broach.databinding.FragmentRequesterHomeBinding
import com.example.broach.features.home.ui.data.CaseHistoryAdapter
import com.example.broach.features.profile.ui.ProfileActivity

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

        val name = arguments?.getString(ARG_NAME)
        val imageUrl = arguments?.getString(ARG_IMAGE_URL)

        setupCaseHistoryRecyclerView()
        setupServiceHistoryRecyclerView()

        binding.btnReportCase.setOnClickListener {
            binding.rvCaseHistory.visibility = View.VISIBLE
        }

        binding.btnRequestService.setOnClickListener {
            binding.rvServiceHistory.visibility = View.VISIBLE
        }

        // CORRECTED: Added listener for the BottomNavigationView
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_profile -> {
                    val intent = Intent(activity, ProfileActivity::class.java).apply {
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
        binding.tvGreeting.text = "Hello, $name"
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val ARG_NAME = "USER_NAME"
        private const val ARG_IMAGE_URL = "USER_IMAGE_URL"

        fun newInstance(name: String?, imageUrl: String?): RequesterHomeFragment {
            val fragment = RequesterHomeFragment()
            val args = Bundle()
            args.putString(ARG_NAME, name)
            args.putString(ARG_IMAGE_URL, imageUrl)
            fragment.arguments = args
            return fragment
        }
    }
}