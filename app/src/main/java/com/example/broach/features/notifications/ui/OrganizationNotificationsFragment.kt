package com.example.broach.features.notifications.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.broach.databinding.FragmentOrganizationNotificationsBinding
import com.example.broach.features.notifications.data.NotificationType
import com.example.broach.features.notifications.data.OrganizationNotification

class OrganizationNotificationsFragment : Fragment() {

    private var _binding: FragmentOrganizationNotificationsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrganizationNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // TODO: Replace with your actual data fetching logic
        val notifications = getDummyNotifications()

        if (notifications.isEmpty()) {
            binding.rvNotifications.visibility = View.GONE
            binding.emptyStateView.visibility = View.VISIBLE
        } else {
            binding.rvNotifications.visibility = View.VISIBLE
            binding.emptyStateView.visibility = View.GONE
            setupRecyclerView(notifications)
        }
    }

    private fun setupRecyclerView(notifications: List<OrganizationNotification>) {
        binding.rvNotifications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotifications.adapter = OrganizationNotificationAdapter(notifications)
    }

    private fun getDummyNotifications(): List<OrganizationNotification> {
        // Return an empty list to see the empty state, or populate with dummy data.
        return listOf(
            OrganizationNotification(
                id = "1",
                date = "18 Mar",
                title = "New Case from:",
                userName = "Rilwanu",
                category = "Gender Based Violence",
                userProfileImageUrl = "", // Add a real URL or use a placeholder
                status = OrganizationNotificationStatus.NEW,
                type = NotificationType.CASE
            ),
            OrganizationNotification(
                id = "2",
                date = "1w",
                title = "New Service Request from:",
                userName = "Aisha",
                category = "Social Welfare",
                userProfileImageUrl = "",
                status = OrganizationNotificationStatus.VIEWED,
                type = NotificationType.SERVICE
            ),
            OrganizationNotification(
                id = "3",
                date = "2d",
                title = "New Case from:",
                userName = "Maryam",
                category = "Domestic Abuse",
                userProfileImageUrl = "",
                status = OrganizationNotificationStatus.CLOSED,
                type = NotificationType.CASE
            )
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
