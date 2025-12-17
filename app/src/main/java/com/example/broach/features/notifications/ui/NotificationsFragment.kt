package com.example.broach.features.notifications.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.broach.databinding.FragmentNotificationsBinding
import com.example.broach.features.notifications.data.Notification
import com.example.broach.features.notifications.data.NotificationType

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
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

    private fun setupRecyclerView(notifications: List<Notification>) {
        binding.rvNotifications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotifications.adapter = NotificationAdapter(notifications)
    }

    private fun getDummyNotifications(): List<Notification> {
        // Return an empty list to see the empty state, or populate with dummy data.
        return listOf(
            Notification(
                id = "1",
                date = "18 Mar",
                title = "Case Report with:",
                organizationName = "Charity Heart Foundation",
                category = "Gender Based Violence",
                organizationLogoUrl = "", // Add a real URL or use a placeholder
                status = NotificationStatus.PENDING,
                type = NotificationType.CASE
            ),
            Notification(
                id = "2",
                date = "1w",
                title = "Service Request with:",
                organizationName = "Blue flower Support Services",
                category = "Social Welfare",
                organizationLogoUrl = "",
                status = NotificationStatus.IN_DISCUSSION,
                type = NotificationType.SERVICE
            ),
             Notification(
                id = "3",
                date = "2d",
                title = "Case Report with:",
                organizationName = "Charity Heart Foundation",
                category = "Gender Based Violence",
                organizationLogoUrl = "",
                status = NotificationStatus.CLOSED,
                removalTime = "to be removed in 2 days",
                type = NotificationType.CASE
            )
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
